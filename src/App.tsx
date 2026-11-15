import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Printer,
  CheckCircle2,
  FileText,
  PenTool,
  KeyRound,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  getWeekInfo,
  type ExamDifficulty,
  type GradeLevel,
  type ViewMode,
} from './data/curriculum.ts';
import type {
  EssayGradingResponse,
  ExamData,
  Grade5StudentAnswers,
  Grade7StudentAnswers,
  GradingResult,
  SavedExamRecord,
  ScoreHistoryEntry,
} from './types/exam.ts';
import {
  createEmptyGrade5Answers,
  createEmptyGrade7Answers,
  gradeGrade5Objective,
  gradeGrade7Objective,
} from './utils/grading.ts';
import { formatDuration } from './utils/mathFormat.ts';
import {
  clearScoreHistory,
  deleteSavedExam,
  findLatestExamForConfig,
  getSavedExams,
  getScoreHistory,
  saveExamRecord,
  saveScoreEntry,
} from './utils/storage.ts';
import { ControlSidebar } from './components/ControlSidebar.tsx';
import { Grade5ExamView } from './components/Grade5ExamView.tsx';
import { Grade7ExamView } from './components/Grade7ExamView.tsx';
import { QuickAnswerKeyTable } from './components/QuickAnswerKeyTable.tsx';
import { GradingSummaryBanner } from './components/WorksheetPrimitives.tsx';

export default function App() {
  const [grade, setGrade] = useState<GradeLevel>(5);
  const [week, setWeek] = useState<number>(1);
  const [level, setLevel] = useState<ExamDifficulty>('standard');
  const [mode, setMode] = useState<ViewMode>('practice');

  const [savedExams, setSavedExams] = useState<SavedExamRecord[]>(() => getSavedExams());
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>(() => getScoreHistory());

  const [activeRecord, setActiveRecord] = useState<SavedExamRecord | null>(() => {
    const initial = findLatestExamForConfig(5, 1, 'standard');
    return initial ?? null;
  });

  const [grade5Answers, setGrade5Answers] = useState<Grade5StudentAnswers>(() =>
    createEmptyGrade5Answers(),
  );
  const [grade7Answers, setGrade7Answers] = useState<Grade7StudentAnswers>(() =>
    createEmptyGrade7Answers(),
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRunning && mode === 'practice' && !gradingResult) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning, mode, gradingResult]);

  const resetAttemptState = (startTimer = true) => {
    setGrade5Answers(createEmptyGrade5Answers());
    setGrade7Answers(createEmptyGrade7Answers());
    setGradingResult(null);
    setElapsedSeconds(0);
    setTimerRunning(startTimer);
  };

  // Sync cached exam when switching grade/week/level if one already exists
  const tryLoadCached = (nextGrade: GradeLevel, nextWeek: number, nextLevel: ExamDifficulty) => {
    const cached = findLatestExamForConfig(nextGrade, nextWeek, nextLevel);
    if (cached) {
      setActiveRecord(cached);
      resetAttemptState(true);
    } else {
      setActiveRecord(null);
      resetAttemptState(false);
    }
    setErrorMsg(null);
  };

  const handleChangeGrade = (nextGrade: GradeLevel) => {
    setGrade(nextGrade);
    tryLoadCached(nextGrade, week, level);
  };

  const handleChangeWeek = (nextWeek: number) => {
    setWeek(nextWeek);
    tryLoadCached(grade, nextWeek, level);
  };

  const handleChangeLevel = (nextLevel: ExamDifficulty) => {
    setLevel(nextLevel);
    tryLoadCached(grade, week, nextLevel);
  };

  const generateExam = async (variantMode: boolean) => {
    // If primary generation is clicked and a cached exam exists for this exact config,
    // allow user to either restore immediately; if activeRecord is already showing that cached exam,
    // generate fresh or tell user. Here: if !variantMode and cached exists and not currently active, load it!
    // If already active or none cached, call API.
    if (!variantMode) {
      const cached = findLatestExamForConfig(grade, week, level);
      if (cached && activeRecord?.id !== cached.id) {
        setActiveRecord(cached);
        resetAttemptState(true);
        return;
      }
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const previousSummary = activeRecord
        ? `${activeRecord.exam.title} - ${activeRecord.exam.subtitle}`
        : undefined;

      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          week,
          level,
          variantMode,
          previousSummary,
        }),
      });

      const payload = (await response.json()) as { exam?: ExamData; error?: string };
      if (!response.ok || !payload.exam) {
        throw new Error(payload.error || 'Không thể tạo đề thi lúc này.');
      }

      const saved = saveExamRecord(payload.exam);
      setSavedExams(getSavedExams());
      setActiveRecord(saved);
      resetAttemptState(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tạo đề.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAndGrade = async () => {
    if (!activeRecord) return;
    setIsGrading(true);
    setTimerRunning(false);
    setErrorMsg(null);

    try {
      const exam = activeRecord.exam;
      const objective =
        exam.grade === 5
          ? gradeGrade5Objective(exam, grade5Answers)
          : gradeGrade7Objective(exam, grade7Answers);

      const response = await fetch('/api/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam,
          studentAnswers: exam.grade === 5 ? grade5Answers : grade7Answers,
        }),
      });

      const essayResult = (await response.json()) as EssayGradingResponse & { error?: string };
      if (!response.ok || !Array.isArray(essayResult.items)) {
        throw new Error(essayResult.error || 'Không thể chấm phần tự luận bằng AI.');
      }

      const totalScore = Math.min(
        10,
        Math.round((objective.objectiveEarnedPoints + essayResult.essayEarnedPoints) * 100) / 100,
      );

      const finalResult: GradingResult = {
        objectiveEarnedPoints: objective.objectiveEarnedPoints,
        objectiveMaxPoints: objective.objectiveMaxPoints,
        essayEarnedPoints: essayResult.essayEarnedPoints,
        essayMaxPoints: essayResult.essayMaxPoints,
        totalScore,
        objectiveDetails: objective.objectiveDetails,
        essayResult,
        gradedAt: new Date().toISOString(),
      };

      setGradingResult(finalResult);

      const nextHistory = saveScoreEntry({
        id: `score-${Date.now()}`,
        examId: activeRecord.id,
        grade: exam.grade,
        week: exam.week,
        level: exam.level,
        title: exam.title,
        totalScore,
        objectiveScore: objective.objectiveEarnedPoints,
        essayScore: essayResult.essayEarnedPoints,
        durationSeconds: elapsedSeconds,
        submittedAt: new Date().toISOString(),
      });
      setScoreHistory(nextHistory);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi chấm bài.');
    } finally {
      setIsGrading(false);
    }
  };

  const handlePrintWorksheet = () => {
    if (mode !== 'worksheet') {
      setMode('worksheet');
      setTimeout(() => window.print(), 120);
    } else {
      window.print();
    }
  };

  const weekInfo = getWeekInfo(grade, week);
  const exam = activeRecord?.exam ?? null;
  const displayTimeMinutes = exam ? (exam.grade === 5 ? 40 : exam.timeMinutes) : 40;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar: strict 3-zone contract */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Toán Kết Nối · Đề Theo Tuần
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleChangeGrade(5)}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                grade === 5 ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Lớp 5 (35 tuần)
            </button>
            <button
              type="button"
              onClick={() => handleChangeGrade(7)}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                grade === 7 ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Lớp 7 (35 tuần)
            </button>
            <button
              type="button"
              onClick={() => setMode('practice')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'practice' ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Học sinh làm bài
            </button>
            <button
              type="button"
              onClick={() => setMode('answerKey')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'answerKey' ? 'text-sky-700 font-semibold' : ''
              }`}
            >
              Đáp án & Thang điểm
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handlePrintWorksheet}
              disabled={!exam}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>In / Xuất PDF A4</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="top" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 items-start">
        <ControlSidebar
          grade={grade}
          week={week}
          level={level}
          isGenerating={isGenerating}
          savedExams={savedExams}
          scoreHistory={scoreHistory}
          activeExamId={activeRecord?.id ?? null}
          onChangeGrade={handleChangeGrade}
          onChangeWeek={handleChangeWeek}
          onChangeLevel={handleChangeLevel}
          onGeneratePrimary={() => generateExam(false)}
          onGenerateVariant={() => generateExam(true)}
          onSelectSavedExam={(rec) => {
            setGrade(rec.grade);
            setWeek(rec.week);
            setLevel(rec.level);
            setActiveRecord(rec);
            resetAttemptState(true);
            setErrorMsg(null);
          }}
          onDeleteSavedExam={(id) => {
            const next = deleteSavedExam(id);
            setSavedExams(next);
            if (activeRecord?.id === id) {
              setActiveRecord(null);
            }
          }}
          onClearHistory={() => {
            clearScoreHistory();
            setScoreHistory([]);
          }}
        />

        {/* Right Canvas */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          {/* Workspace Mode Switcher & Timer Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('practice')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'practice'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4 shrink-0" />
                <span>Làm bài trực tuyến</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('worksheet')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'worksheet'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Phiếu bài tập & In PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('answerKey')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mode === 'answerKey'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Đáp án & Hướng dẫn chấm</span>
              </button>
            </div>

            {exam && mode === 'practice' && (
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-sm font-mono-math tabular-nums">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>{formatDuration(elapsedSeconds)}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">{displayTimeMinutes}:00</span>
                </div>
                {!gradingResult && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTimerRunning((r) => !r)}
                      title={timerRunning ? 'Tạm dừng đồng hồ' : 'Tiếp tục bấm giờ'}
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => resetAttemptState(true)}
                      title="Làm lại từ đầu"
                      className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-sm text-rose-900 no-print">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Không thể hoàn tất yêu cầu</div>
                <p className="mt-0.5 text-rose-800">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-white p-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-9 h-9 text-sky-600 animate-spin" />
              <div className="text-base font-bold text-slate-900">
                Đang biên soạn đề Toán Lớp {grade} — Tuần {week}
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                Hệ thống đang đối chiếu phân phối chương trình Kết nối tri thức (Tuần 1 đến Tuần {week}),
                tính toán kiểm tra đáp số và dựng hình vẽ SVG chuẩn xác.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isGenerating && !exam && (
            <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-white p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-xl">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-balance">
                  Đề luyện tập Toán Lớp {grade} · Tuần {week}
                </h1>
                <p className="text-sm text-slate-600">
                  {weekInfo.unit} — {weekInfo.lessons}
                </p>
                <p className="text-xs text-slate-500 pt-1">
                  Mức độ: {level === 'advanced' ? 'Nâng cao (Khá - Giỏi)' : 'Chuẩn SGK'} · Hỗ trợ
                  chấm bài Tự luận bằng AI và xuất phiếu bài tập A4.
                </p>
              </div>
              <button
                type="button"
                onClick={() => generateExam(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tạo đề tuần {week} ngay</span>
              </button>
            </div>
          )}

          {/* Active Exam Paper Sheet */}
          {!isGenerating && exam && (
            <div className="print-sheet bg-white border-2 border-dashed border-sky-400 rounded-2xl p-5 sm:p-8 shadow-sm">
              {/* Worksheet Header */}
              <div className="pb-5 mb-6 border-b border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-sky-700">
                      Toán Lớp {exam.grade} · Kết nối tri thức với cuộc sống · Tuần {exam.week}
                      {exam.level === 'advanced' ? ' · Mức độ Nâng cao' : ' · Chuẩn SGK'}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight text-balance">
                      {exam.title}
                    </h1>
                    <p className="text-sm text-slate-600">{exam.subtitle}</p>
                  </div>
                  <div className="text-xs sm:text-right text-slate-600 shrink-0 tabular-nums space-y-0.5">
                    <div className="font-semibold text-slate-900">
                      Thời gian làm bài: {displayTimeMinutes} phút
                    </div>
                    <div>Thang điểm: 10,0 điểm</div>
                    <div>{exam.variantLabel || 'Đề luyện tập tuần'}</div>
                  </div>
                </div>

                {/* Student Info Row (especially clear in Worksheet & Print mode) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-700">
                  <div>Họ và tên: ........................................</div>
                  <div>Lớp: {exam.grade}........</div>
                  <div>Điểm số: ............... / 10</div>
                </div>
              </div>

              {/* Grading Result Banner */}
              {mode === 'practice' && gradingResult && (
                <GradingSummaryBanner
                  result={gradingResult}
                  elapsedSeconds={elapsedSeconds}
                  onResetAttempt={() => resetAttemptState(true)}
                />
              )}

              {/* Answer Key Quick Grid */}
              {mode === 'answerKey' && <QuickAnswerKeyTable exam={exam} />}

              {/* Exam Body */}
              {exam.grade === 5 ? (
                <Grade5ExamView
                  exam={exam}
                  mode={mode}
                  answers={grade5Answers}
                  onChangeAnswers={setGrade5Answers}
                  gradingResult={gradingResult}
                />
              ) : (
                <Grade7ExamView
                  exam={exam}
                  mode={mode}
                  answers={grade7Answers}
                  onChangeAnswers={setGrade7Answers}
                  gradingResult={gradingResult}
                />
              )}

              {/* Submit Button Footer in Practice Mode */}
              {mode === 'practice' && !gradingResult && (
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print">
                  <p className="text-xs text-slate-500 max-w-lg">
                    Khi nhấn nộp bài, hệ thống sẽ chấm chính xác phần Trắc nghiệm, Đúng/Sai, Trả lời
                    ngắn và dùng AI chấm từng bước phần Tự luận theo thang điểm 0,25đ.
                  </p>
                  <button
                    type="button"
                    disabled={isGrading}
                    onClick={handleSubmitAndGrade}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isGrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang chấm bài với AI...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Nộp bài & Chấm điểm</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
