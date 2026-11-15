import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  RefreshCw,
  Trash2,
  History,
  FolderOpen,
  Check,
} from 'lucide-react';
import {
  getCurriculumForGrade,
  getWeekInfo,
  type ExamDifficulty,
  type GradeLevel,
} from '../data/curriculum.ts';
import type { SavedExamRecord, ScoreHistoryEntry } from '../types/exam.ts';
import { formatDuration, formatScoreVi } from '../utils/mathFormat.ts';

interface ControlSidebarProps {
  grade: GradeLevel;
  week: number;
  level: ExamDifficulty;
  isGenerating: boolean;
  savedExams: SavedExamRecord[];
  scoreHistory: ScoreHistoryEntry[];
  activeExamId: string | null;
  onChangeGrade: (grade: GradeLevel) => void;
  onChangeWeek: (week: number) => void;
  onChangeLevel: (level: ExamDifficulty) => void;
  onGeneratePrimary: () => void;
  onGenerateVariant: () => void;
  onSelectSavedExam: (record: SavedExamRecord) => void;
  onDeleteSavedExam: (id: string) => void;
  onClearHistory: () => void;
}

export const ControlSidebar: React.FC<ControlSidebarProps> = ({
  grade,
  week,
  level,
  isGenerating,
  savedExams,
  scoreHistory,
  activeExamId,
  onChangeGrade,
  onChangeWeek,
  onChangeLevel,
  onGeneratePrimary,
  onGenerateVariant,
  onSelectSavedExam,
  onDeleteSavedExam,
  onClearHistory,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'saved' | 'scores'>('saved');
  const curriculumList = getCurriculumForGrade(grade);
  const currentWeekInfo = getWeekInfo(grade, week);

  const savedWeeksForGrade = new Set(
    savedExams.filter((e) => e.grade === grade).map((e) => e.week),
  );
  const matchingSaved = savedExams.filter(
    (e) => e.grade === grade && e.week === week,
  );

  const completedWeeksCount = new Set(
    scoreHistory.filter((entry) => entry.grade === grade).map((entry) => entry.week),
  ).size;
  const isAdvancedUnlocked = completedWeeksCount >= 18;
  const isVariantUnlocked = completedWeeksCount >= 35;

  return (
    <aside className="w-full lg:w-[340px] shrink-0 space-y-5 no-print">
      {/* Main Configuration Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600">
            1. Chọn Khối lớp (Kết nối tri thức)
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
            {([5, 7] as GradeLevel[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onChangeGrade(g)}
                className={`py-2 px-3 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  grade === g
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toán Lớp {g}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="week-select" className="text-xs font-semibold text-slate-600">
              2. Chọn Tuần học (1 – 35)
            </label>
            {currentWeekInfo.specialLabel && (
              <span className="text-xs font-semibold text-amber-700">
                {currentWeekInfo.specialLabel}
              </span>
            )}
          </div>
          <select
            id="week-select"
            value={week}
            onChange={(e) => onChangeWeek(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {curriculumList.map((item) => {
              const hasCached = savedWeeksForGrade.has(item.week);
              const marker = item.specialLabel ? ` [${item.specialLabel}]` : '';
              const cachedMark = hasCached ? ' ✓' : '';
              return (
                <option key={item.week} value={item.week}>
                  Tuần {item.week} · {item.unit}
                  {marker}
                  {cachedMark}
                </option>
              );
            })}
          </select>

          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs leading-relaxed text-slate-700">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>
                Tuần {currentWeekInfo.week} · {currentWeekInfo.unit}
              </span>
            </div>
            <p className="mt-1 text-slate-600">{currentWeekInfo.lessons}</p>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Phạm vi kiến thức: chỉ từ Tuần 1 đến hết Tuần {currentWeekInfo.week}.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-600">
            3. Mức độ đề thi
          </label>
          <div
            className={`grid gap-1.5 p-1 bg-slate-100 rounded-xl ${
              isAdvancedUnlocked ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            <button
              type="button"
              onClick={() => onChangeLevel('standard')}
              className={`py-2 px-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                level === 'standard'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chuẩn SGK
            </button>
            {isAdvancedUnlocked && (
              <button
                type="button"
                onClick={() => onChangeLevel('advanced')}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  level === 'advanced'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nâng cao (Khá - Giỏi)
              </button>
            )}
          </div>
          {!isAdvancedUnlocked && (
            <p className="text-[11px] text-slate-500">
              Mức Nâng cao (Khá - Giỏi) sẽ hiển thị sau khi hoàn thành 18 tuần (đã làm {completedWeeksCount}/18 tuần).
            </p>
          )}
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={isGenerating}
            onClick={onGeneratePrimary}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              {isGenerating
                ? 'Đang tạo đề bằng AI...'
                : level === 'standard'
                  ? 'Mở đề chuẩn tuần này (Tạo sẵn)'
                  : 'Tạo đề nâng cao tuần này'}
            </span>
          </button>

          {isVariantUnlocked && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={onGenerateVariant}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Sinh đề biến thể mới (AI)</span>
            </button>
          )}
          <p className="text-[11px] leading-relaxed text-slate-500">
            {isVariantUnlocked
              ? 'Đủ 35/35 đề chuẩn SGK tạo sẵn (0 lượt API). Đã mở khóa đầy đủ đề Nâng cao và Sinh đề biến thể mới (AI).'
              : `Đủ 35/35 đề chuẩn SGK tạo sẵn (0 lượt API). Nút Sinh đề biến thể mới (AI) sẽ hiển thị sau khi hoàn thành đủ 35 tuần (đã làm ${completedWeeksCount}/35 tuần).`}
          </p>
        </div>
      </div>

      {/* Quick Week Grid (1-35) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Chọn nhanh Tuần (Lớp {grade})</span>
          <span className="text-slate-500 font-normal">
            Có sẵn 35/35 · AI lưu: {savedWeeksForGrade.size}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {curriculumList.map((item) => {
            const isSelected = item.week === week;
            const isSaved = savedWeeksForGrade.has(item.week);
            const isExamWeek = Boolean(item.specialType);

            return (
              <button
                key={item.week}
                type="button"
                title={`Tuần ${item.week}: ${item.lessons}`}
                onClick={() => onChangeWeek(item.week)}
                className={`relative h-8 rounded-lg text-xs font-semibold tabular-nums transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white'
                    : isExamWeek
                      ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                      : isSaved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.week}
                {isSaved && !isSelected && (
                  <Check className="w-2.5 h-2.5 absolute top-0.5 right-0.5 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved Exams & Score History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setSidebarTab('saved')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              sidebarTab === 'saved'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Đề đã lưu ({savedExams.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab('scores')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              sidebarTab === 'scores'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử điểm ({scoreHistory.length})</span>
          </button>
        </div>

        {sidebarTab === 'saved' ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {matchingSaved.length > 0 && (
              <div className="text-[11px] font-semibold text-sky-700 pb-1">
                Đề của Lớp {grade} · Tuần {week}
              </div>
            )}
            {savedExams.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Chưa có đề nào được lưu. Nhấn &ldquo;Tạo đề tuần này&rdquo; để bắt đầu.
              </p>
            ) : (
              savedExams.map((rec) => {
                const isActive = rec.id === activeExamId;
                return (
                  <div
                    key={rec.id}
                    className={`flex items-start justify-between gap-2 rounded-xl border p-2.5 text-xs transition-colors ${
                      isActive
                        ? 'border-sky-400 bg-sky-50/70'
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSavedExam(rec)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <div className="font-semibold text-slate-900">
                        Lớp {rec.grade} · Tuần {rec.week}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {rec.level === 'advanced' ? 'Nâng cao' : 'Chuẩn SGK'} ·{' '}
                        {rec.exam.variantLabel || 'Đề gốc'}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSavedExam(rec.id)}
                      title="Xóa đề này"
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {scoreHistory.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Chưa có lịch sử làm bài. Hãy nộp bài ở chế độ Làm bài trực tuyến.
              </p>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Xóa lịch sử
                  </button>
                </div>
                {scoreHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>
                        Lớp {entry.grade} · Tuần {entry.week}
                      </span>
                      <span className="font-mono-math tabular-nums text-sky-700">
                        {formatScoreVi(entry.totalScore)} / 10 đ
                      </span>
                    </div>
                    <div className="text-slate-500 flex items-center justify-between tabular-nums">
                      <span>
                        {entry.level === 'advanced' ? 'Nâng cao' : 'Chuẩn SGK'} ·{' '}
                        {formatDuration(entry.durationSeconds)}
                      </span>
                      <span>
                        {new Date(entry.submittedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
