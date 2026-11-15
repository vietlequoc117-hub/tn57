import React from 'react';
import type { ViewMode } from '../data/curriculum.ts';
import type {
  Grade5Exam,
  Grade5StudentAnswers,
  GradingResult,
  OptionKey,
} from '../types/exam.ts';
import { formatScoreVi } from '../utils/mathFormat.ts';
import { MathRenderer } from './MathRenderer.tsx';
import { MathSvg } from './MathSvg.tsx';
import {
  DottedLines,
  EssayFeedbackCard,
  QuestionBadge,
  SectionHeader,
} from './WorksheetPrimitives.tsx';

interface Grade5ExamViewProps {
  exam: Grade5Exam;
  mode: ViewMode;
  answers: Grade5StudentAnswers;
  onChangeAnswers: React.Dispatch<React.SetStateAction<Grade5StudentAnswers>>;
  gradingResult: GradingResult | null;
}

const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

export const Grade5ExamView: React.FC<Grade5ExamViewProps> = ({
  exam,
  mode,
  answers,
  onChangeAnswers,
  gradingResult,
}) => {
  const isPractice = mode === 'practice';
  const isWorksheet = mode === 'worksheet';
  const isAnswerKey = mode === 'answerKey';
  const isLocked = Boolean(gradingResult) && isPractice;

  const findEssayFeedback = (itemId: string) =>
    gradingResult?.essayResult.items.find((it) => it.itemId === itemId);

  return (
    <div className="space-y-6 text-slate-900">
      {/* I. MULTIPLE CHOICE */}
      <section className="space-y-4">
        <SectionHeader
          title="I. PHẦN TRẮC NGHIỆM (4 điểm)"
          subtitle="Khoanh vào chữ cái đặt trước câu trả lời đúng hoặc làm theo yêu cầu:"
        />

        <div className="space-y-4">
          {exam.multipleChoice.map((q) => {
            const detail = gradingResult?.objectiveDetails[`mc_${q.id}`];
            const selected = answers.mc[q.id];

            return (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-4 print-avoid-break"
              >
                <div className="flex flex-wrap items-start gap-2.5">
                  <QuestionBadge
                    label={`Câu ${q.id}`}
                    pointsText={`${formatScoreVi(q.points || 0.5)} điểm`}
                  />
                  <div className="flex-1 text-[15px] leading-relaxed font-medium text-slate-900">
                    <MathRenderer text={q.question} />
                  </div>
                </div>

                {q.svg && <MathSvg svg={q.svg} />}

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {OPTION_KEYS.map((key) => {
                    const isSelected = selected === key;
                    const isCorrectOption = q.correctOption === key;

                    let cardClass = 'border-dashed border-sky-300 bg-white hover:bg-sky-50/50';
                    if (isAnswerKey && isCorrectOption) {
                      cardClass = 'border-solid border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-400';
                    } else if (isPractice && gradingResult) {
                      if (isCorrectOption) {
                        cardClass = 'border-solid border-emerald-500 bg-emerald-50/80';
                      } else if (isSelected && !isCorrectOption) {
                        cardClass = 'border-solid border-rose-400 bg-rose-50/80';
                      }
                    } else if (isPractice && isSelected) {
                      cardClass = 'border-solid border-sky-600 bg-sky-50 ring-1 ring-sky-500';
                    }

                    const badgeClass =
                      (isPractice && isSelected) || (isAnswerKey && isCorrectOption)
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-sky-50 text-sky-800 border-sky-300';

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={!isPractice || isLocked}
                        onClick={() =>
                          onChangeAnswers((prev) => ({
                            ...prev,
                            mc: { ...prev.mc, [q.id]: key },
                          }))
                        }
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-[15px] transition-colors ${
                          isPractice && !isLocked ? 'cursor-pointer' : 'cursor-default'
                        } ${cardClass}`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-sm font-bold shrink-0 ${badgeClass}`}
                        >
                          {key}
                        </span>
                        <span className="leading-snug">
                          <MathRenderer text={q.options[key]} />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {isPractice && detail && (
                  <div
                    className={`mt-2.5 text-xs px-3 py-2 rounded-lg no-print ${
                      detail.isCorrect
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    <strong>{detail.isCorrect ? 'Đúng (+0,5đ)' : `Chưa đúng (Đáp án: ${q.correctOption})`}:</strong>{' '}
                    <MathRenderer text={q.explanation} />
                  </div>
                )}

                {isAnswerKey && (
                  <div className="mt-2.5 text-sm bg-emerald-50/70 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-950">
                    <strong>Đáp án đúng: {q.correctOption}.</strong>{' '}
                    <MathRenderer text={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* II. ESSAY */}
      <section className="space-y-5">
        <SectionHeader
          title="II. PHẦN TỰ LUẬN (6 điểm)"
          subtitle="Nhập kết quả / đáp số cuối cùng từ Câu 1 đến Câu 5 (không cần trình bày cách làm):"
        />

        {/* Câu 1 (1 điểm) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
          <div className="flex flex-wrap items-start gap-2.5">
            <QuestionBadge label="Câu 1" pointsText="1 điểm" />
            <div className="flex-1 text-[15px] font-medium leading-relaxed">
              <MathRenderer text={exam.essay.q1.prompt} />
            </div>
          </div>

          {exam.essay.q1.svg && <MathSvg svg={exam.essay.q1.svg} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {exam.essay.q1.items.map((item) => {
              const detail = gradingResult?.objectiveDetails[`q1_${item.label}`];
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-dashed border-sky-300 bg-sky-50/20 p-3 flex flex-wrap items-center gap-2 text-[15px]"
                >
                  <span className="font-bold text-sky-900">{item.label})</span>
                  <span>
                    <MathRenderer text={item.prompt} />
                  </span>
                  {isPractice ? (
                    <input
                      type="text"
                      disabled={isLocked}
                      value={answers.q1[item.label] ?? ''}
                      onChange={(e) =>
                        onChangeAnswers((prev) => ({
                          ...prev,
                          q1: { ...prev.q1, [item.label]: e.target.value },
                        }))
                      }
                      placeholder="..."
                      className="min-w-[110px] flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  ) : isWorksheet ? (
                    <span className="inline-block min-w-[110px] border-b border-dotted border-slate-500 text-transparent select-none">
                      ....................
                    </span>
                  ) : (
                    <span className="inline-block rounded-md bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 font-mono-math">
                      <MathRenderer text={item.answer} />
                    </span>
                  )}
                  {item.unit && <span className="text-slate-700">{item.unit}</span>}
                  {isPractice && detail && (
                    <div
                      className={`w-full text-xs mt-1 font-medium ${
                        detail.isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {detail.isCorrect
                        ? 'Đúng (+0,25đ)'
                        : `Đáp án đúng: ${item.answer}${item.unit ? ` ${item.unit}` : ''}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Câu 2 (2 điểm) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 print-avoid-break">
          <div className="flex flex-wrap items-center gap-2.5">
            <QuestionBadge label="Câu 2" pointsText="2 điểm" />
          </div>

          {/* 2a. Đặt tính rồi tính */}
          <div className="space-y-2.5">
            <p className="text-[15px] font-semibold text-slate-900">
              a. Đặt tính rồi tính (1 điểm):{' '}
              <span className="font-normal text-slate-600">
                <MathRenderer text={exam.essay.q2.partA.prompt} />
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exam.essay.q2.partA.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-xl border border-slate-300 bg-slate-50/40 p-3.5 space-y-2.5"
                >
                  <div className="text-base font-bold text-sky-950 font-mono-math">
                    <MathRenderer text={item.expression} />
                  </div>
                  {isPractice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                        Kết quả =
                      </span>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={answers.q2aResult[item.id] ?? ''}
                        onChange={(e) =>
                          onChangeAnswers((prev) => ({
                            ...prev,
                            q2aResult: { ...prev.q2aResult, [item.id]: e.target.value },
                          }))
                        }
                        placeholder="Nhập kết quả..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  ) : isWorksheet ? (
                    <>
                      <div className="h-28 rounded-lg border border-dashed border-slate-300 bg-white dotted-grid-paper" />
                      <div className="text-sm font-semibold text-slate-700 pt-1">
                        Kết quả = ........................................
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-sm space-y-1">
                      <div className="font-bold text-emerald-900">
                        Kết quả = <MathRenderer text={item.result} /> (0,5đ)
                      </div>
                      <div className="text-slate-700">
                        <MathRenderer text={item.stepsNote} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('q2a')} />}
          </div>

          {/* 2b. Tính bằng cách thuận tiện */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <p className="text-[15px] font-semibold text-slate-900">
              b. Tính bằng cách thuận tiện (1 điểm):{' '}
              <span className="font-normal text-slate-600">
                <MathRenderer text={exam.essay.q2.partB.prompt} />
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exam.essay.q2.partB.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-xl border border-slate-300 bg-slate-50/40 p-3.5 space-y-2.5"
                >
                  <div className="text-base font-bold text-sky-950">
                    <MathRenderer text={item.expression} />
                  </div>
                  {isPractice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                        Kết quả =
                      </span>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={answers.q2bResult[item.id] ?? ''}
                        onChange={(e) =>
                          onChangeAnswers((prev) => ({
                            ...prev,
                            q2bResult: { ...prev.q2bResult, [item.id]: e.target.value },
                          }))
                        }
                        placeholder="Nhập kết quả..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  ) : isWorksheet ? (
                    <>
                      <DottedLines count={3} />
                      <div className="text-sm font-semibold text-slate-700 pt-1">
                        Kết quả = ........................................
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-sm space-y-1">
                      {item.solutionSteps.map((step, sIdx) => (
                        <div key={sIdx}>
                          = <MathRenderer text={step} />
                        </div>
                      ))}
                      <div className="font-bold text-emerald-900 pt-1">
                        Kết quả = <MathRenderer text={item.result} /> (0,5đ)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('q2b')} />}
          </div>
        </div>

        {/* Câu 3 (1 điểm) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
          <div className="flex flex-wrap items-start gap-2.5">
            <QuestionBadge label="Câu 3" pointsText="1 điểm" />
            <div className="flex-1 text-[15px] font-medium leading-relaxed">
              <MathRenderer text={exam.essay.q3.prompt} />
            </div>
          </div>

          {exam.essay.q3.tableData && exam.essay.q3.tableData.headers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-sm">
                <thead>
                  <tr className="bg-sky-50">
                    {exam.essay.q3.tableData.headers.map((h, idx) => (
                      <th key={idx} className="border border-slate-300 px-3 py-2 text-left font-bold">
                        <MathRenderer text={h} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exam.essay.q3.tableData.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="border border-slate-300 px-3 py-2 tabular-nums">
                          <MathRenderer text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {exam.essay.q3.svg && <MathSvg svg={exam.essay.q3.svg} />}

          <div className="space-y-3">
            {exam.essay.q3.items.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-2">
                <div className="text-[15px]">
                  <strong className="text-sky-900">{item.label})</strong>{' '}
                  <MathRenderer text={item.prompt} />
                </div>
                {isPractice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                      Đáp số {item.label}):
                    </span>
                    <input
                      type="text"
                      disabled={isLocked}
                      value={answers.q3[item.label] ?? ''}
                      onChange={(e) =>
                        onChangeAnswers((prev) => ({
                          ...prev,
                          q3: { ...prev.q3, [item.label]: e.target.value },
                        }))
                      }
                      placeholder={`Nhập đáp số ý ${item.label})...`}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                ) : isWorksheet ? (
                  <DottedLines count={2} />
                ) : (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-sm space-y-1">
                    {item.solutionSteps.map((s, idx) => (
                      <div key={idx}>
                        • <MathRenderer text={s} />
                      </div>
                    ))}
                    <div className="font-bold text-emerald-900">
                      Đáp số {item.label}): <MathRenderer text={item.answer} /> (0,5đ)
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('q3')} />}
        </div>

        {/* Câu 4 (1,5 điểm) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
          <div className="flex flex-wrap items-start gap-2.5">
            <QuestionBadge label="Câu 4" pointsText="1,5 điểm" />
            <div className="flex-1 text-[15px] font-medium leading-relaxed">
              <MathRenderer text={exam.essay.q4.prompt} />
            </div>
          </div>

          {exam.essay.q4.svg && <MathSvg svg={exam.essay.q4.svg} />}

          <div className="rounded-xl border border-slate-300 bg-slate-50/40 p-4 space-y-2.5">
            {isPractice ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-bold text-slate-800 whitespace-nowrap">Đáp số:</span>
                <input
                  type="text"
                  disabled={isLocked}
                  value={answers.q4Answer}
                  onChange={(e) =>
                    onChangeAnswers((prev) => ({ ...prev, q4Answer: e.target.value }))
                  }
                  placeholder="Nhập đáp số (VD: 480 kg gạo hoặc 480)..."
                  className="flex-1 min-w-[220px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            ) : isWorksheet ? (
              <>
                <DottedLines count={6} />
                <div className="text-right font-semibold text-slate-800 pt-1">
                  Đáp số: ...........................................
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm space-y-1.5">
                {exam.essay.q4.solutionSteps.map((step, idx) => (
                  <div key={idx}>
                    <MathRenderer text={step} />
                  </div>
                ))}
                <div className="text-right font-bold text-emerald-900 pt-1">
                  Đáp số: <MathRenderer text={exam.essay.q4.finalAnswer} />
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-slate-700 space-y-0.5">
                  <strong>Thang điểm:</strong>
                  {exam.essay.q4.rubric.map((r, rIdx) => (
                    <div key={rIdx}>• {r}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('q4')} />}
        </div>

        {/* Câu 5 (0,5 điểm) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
          <div className="flex flex-wrap items-start gap-2.5">
            <QuestionBadge label="Câu 5" pointsText="0,5 điểm · Vận dụng cao" />
            <div className="flex-1 text-[15px] font-medium leading-relaxed">
              <MathRenderer text={exam.essay.q5.prompt} />
            </div>
          </div>

          {exam.essay.q5.svg && <MathSvg svg={exam.essay.q5.svg} />}

          <div className="rounded-xl border border-slate-300 bg-slate-50/40 p-4 space-y-2.5">
            {isPractice ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-bold text-slate-800 whitespace-nowrap">Đáp số:</span>
                <input
                  type="text"
                  disabled={isLocked}
                  value={answers.q5Answer}
                  onChange={(e) =>
                    onChangeAnswers((prev) => ({ ...prev, q5Answer: e.target.value }))
                  }
                  placeholder="Nhập đáp số cuối cùng..."
                  className="flex-1 min-w-[220px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            ) : isWorksheet ? (
              <>
                <DottedLines count={4} />
                <div className="text-right font-semibold text-slate-800 pt-1">
                  Đáp số: ...........................................
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm space-y-1.5">
                {exam.essay.q5.solutionSteps.map((step, idx) => (
                  <div key={idx}>
                    <MathRenderer text={step} />
                  </div>
                ))}
                <div className="text-right font-bold text-emerald-900 pt-1">
                  Đáp số: <MathRenderer text={exam.essay.q5.finalAnswer} />
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-slate-700 space-y-0.5">
                  <strong>Thang điểm:</strong>
                  {exam.essay.q5.rubric.map((r, rIdx) => (
                    <div key={rIdx}>• {r}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('q5')} />}
        </div>
      </section>
    </div>
  );
};
