import React from 'react';
import type { ViewMode } from '../data/curriculum.ts';
import type {
  Grade7Exam,
  Grade7StudentAnswers,
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

interface Grade7ExamViewProps {
  exam: Grade7Exam;
  mode: ViewMode;
  answers: Grade7StudentAnswers;
  onChangeAnswers: React.Dispatch<React.SetStateAction<Grade7StudentAnswers>>;
  gradingResult: GradingResult | null;
}

const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

export const Grade7ExamView: React.FC<Grade7ExamViewProps> = ({
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
    <div className="space-y-7 text-slate-900">
      {/* A. TRẮC NGHIỆM (7,0 điểm) */}
      <section className="space-y-6">
        <SectionHeader title="A. TRẮC NGHIỆM (7,0 điểm)" />

        {/* Phần 1 (3,0 điểm) */}
        <div className="space-y-3.5">
          <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-2.5 text-sm">
            <div className="font-bold text-sky-950">
              Phần 1. (3,0 điểm) Câu trắc nghiệm nhiều phương án lựa chọn.
            </div>
            <div className="italic text-sky-900 mt-0.5">
              Trong mỗi câu hỏi từ câu 1 đến câu 12, hãy chọn phương án đúng duy nhất (mỗi câu đúng được 0,25 điểm).
            </div>
          </div>

          <div className="space-y-3.5">
            {exam.part1MultipleChoice.map((q) => {
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
                      pointsText={`${formatScoreVi(q.points || 0.25)} điểm`}
                    />
                    <div className="flex-1 text-[15px] leading-relaxed font-medium">
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
                      <strong>
                        {detail.isCorrect ? 'Đúng (+0,25đ)' : `Chưa đúng (Đáp án: ${q.correctOption})`}:
                      </strong>{' '}
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
        </div>

        {/* Phần 2 (2,0 điểm) - Đúng / Sai */}
        <div className="space-y-4">
          <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-2.5 text-sm">
            <div className="font-bold text-sky-950">
              Phần 2. (2,0 điểm) Câu trắc nghiệm đúng sai.
            </div>
            <div className="italic text-sky-900 mt-0.5">
              Trong câu 13, 14, hãy đánh dấu X vào cột Đúng hoặc Sai cho mỗi ý a), b), c), d) (mỗi ý đúng được 0,25 điểm).
            </div>
          </div>

          {exam.part2TrueFalse.map((tfQ) => (
            <div
              key={tfQ.id}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break"
            >
              <div className="flex flex-wrap items-start gap-2.5">
                <QuestionBadge label={`Câu ${tfQ.id}`} pointsText="1,0 điểm" />
                <div className="flex-1 text-[15px] font-medium leading-relaxed">
                  <MathRenderer text={tfQ.stem} />
                </div>
              </div>

              {tfQ.svg && <MathSvg svg={tfQ.svg} />}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 text-sm">
                  <thead>
                    <tr className="bg-sky-50 text-sky-950">
                      <th className="border border-slate-300 px-3 py-2 w-12 text-center font-bold">
                        Ý
                      </th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-bold">
                        Khẳng định
                      </th>
                      <th className="border border-slate-300 px-3 py-2 w-20 text-center font-bold">
                        Đúng
                      </th>
                      <th className="border border-slate-300 px-3 py-2 w-20 text-center font-bold">
                        Sai
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tfQ.statements.map((stmt) => {
                      const chosen = answers.tf[tfQ.id]?.[stmt.label];
                      const detail = gradingResult?.objectiveDetails[`tf_${tfQ.id}_${stmt.label}`];

                      return (
                        <React.Fragment key={stmt.label}>
                          <tr className="bg-white">
                            <td className="border border-slate-300 px-3 py-2.5 text-center font-bold text-sky-900">
                              {stmt.label})
                            </td>
                            <td className="border border-slate-300 px-3 py-2.5 leading-relaxed">
                              <MathRenderer text={stmt.text} />
                            </td>
                            <td className="border border-slate-300 px-3 py-2.5 text-center">
                              {isPractice ? (
                                <button
                                  type="button"
                                  disabled={isLocked}
                                  onClick={() =>
                                    onChangeAnswers((prev) => ({
                                      ...prev,
                                      tf: {
                                        ...prev.tf,
                                        [tfQ.id]: {
                                          ...(prev.tf[tfQ.id] || {}),
                                          [stmt.label]: true,
                                        },
                                      },
                                    }))
                                  }
                                  aria-label={`Câu ${tfQ.id} ý ${stmt.label} Đúng`}
                                  className={`w-7 h-7 rounded border inline-flex items-center justify-center font-bold transition-colors ${
                                    isLocked ? 'cursor-default' : 'cursor-pointer'
                                  } ${
                                    chosen === true
                                      ? 'bg-sky-600 text-white border-sky-600'
                                      : 'bg-white border-slate-400 text-slate-400 hover:border-sky-500'
                                  }`}
                                >
                                  {chosen === true ? 'X' : ''}
                                </button>
                              ) : isWorksheet ? (
                                <span className="inline-block w-6 h-6 border border-slate-500 rounded-sm align-middle" />
                              ) : (
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded border font-bold ${
                                    stmt.isTrue
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {stmt.isTrue ? 'X' : ''}
                                </span>
                              )}
                            </td>
                            <td className="border border-slate-300 px-3 py-2.5 text-center">
                              {isPractice ? (
                                <button
                                  type="button"
                                  disabled={isLocked}
                                  onClick={() =>
                                    onChangeAnswers((prev) => ({
                                      ...prev,
                                      tf: {
                                        ...prev.tf,
                                        [tfQ.id]: {
                                          ...(prev.tf[tfQ.id] || {}),
                                          [stmt.label]: false,
                                        },
                                      },
                                    }))
                                  }
                                  aria-label={`Câu ${tfQ.id} ý ${stmt.label} Sai`}
                                  className={`w-7 h-7 rounded border inline-flex items-center justify-center font-bold transition-colors ${
                                    isLocked ? 'cursor-default' : 'cursor-pointer'
                                  } ${
                                    chosen === false
                                      ? 'bg-sky-600 text-white border-sky-600'
                                      : 'bg-white border-slate-400 text-slate-400 hover:border-sky-500'
                                  }`}
                                >
                                  {chosen === false ? 'X' : ''}
                                </button>
                              ) : isWorksheet ? (
                                <span className="inline-block w-6 h-6 border border-slate-500 rounded-sm align-middle" />
                              ) : (
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded border font-bold ${
                                    !stmt.isTrue
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {!stmt.isTrue ? 'X' : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                          {(isAnswerKey || (isPractice && detail)) && (
                            <tr className="bg-slate-50/70">
                              <td colSpan={4} className="border border-slate-300 px-3 py-1.5 text-xs">
                                {isPractice && detail ? (
                                  <span
                                    className={
                                      detail.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                                    }
                                  >
                                    <strong>
                                      {detail.isCorrect
                                        ? 'Đúng (+0,25đ)'
                                        : `Chưa đúng (Đáp án: ${stmt.isTrue ? 'Đúng' : 'Sai'})`}
                                      :
                                    </strong>{' '}
                                    <MathRenderer text={stmt.explanation} />
                                  </span>
                                ) : (
                                  <span className="text-emerald-900">
                                    <strong>{stmt.isTrue ? 'Đúng' : 'Sai'}:</strong>{' '}
                                    <MathRenderer text={stmt.explanation} />
                                  </span>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Phần 3 (2,0 điểm) - Trả lời ngắn */}
        <div className="space-y-3.5">
          <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-2.5 text-sm">
            <div className="font-bold text-sky-950">
              Phần 3. (2,0 điểm) Câu hỏi trắc nghiệm trả lời ngắn.
            </div>
            <div className="italic text-sky-900 mt-0.5">
              Trong các câu từ 15 đến 18, hãy viết câu trả lời / đáp án vào bài làm mà không cần trình bày lời giải chi tiết (mỗi câu đúng được 0,5 điểm).
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {exam.part3ShortAnswer.map((q) => {
              const detail = gradingResult?.objectiveDetails[`short_${q.id}`];

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 print-avoid-break"
                >
                  <div className="flex flex-wrap items-start gap-2.5">
                    <QuestionBadge
                      label={`Câu ${q.id}`}
                      pointsText={`${formatScoreVi(q.points || 0.5)} điểm`}
                    />
                    <div className="flex-1 text-[15px] font-medium leading-relaxed">
                      <MathRenderer text={q.question} />
                    </div>
                  </div>

                  {q.svg && <MathSvg svg={q.svg} />}

                  <div className="pt-1 flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-700 whitespace-nowrap">
                      Đáp án:
                    </span>
                    {isPractice ? (
                      <input
                        type="text"
                        disabled={isLocked}
                        value={answers.short[q.id] ?? ''}
                        onChange={(e) =>
                          onChangeAnswers((prev) => ({
                            ...prev,
                            short: { ...prev.short, [q.id]: e.target.value },
                          }))
                        }
                        placeholder="VD: 3/5 hoặc -2,5"
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    ) : isWorksheet ? (
                      <div className="flex-1 dotted-write-line" />
                    ) : (
                      <span className="rounded-md bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 font-mono-math">
                        <MathRenderer text={q.displayAnswer} />
                      </span>
                    )}
                  </div>

                  {isPractice && detail && (
                    <div
                      className={`text-xs px-3 py-2 rounded-lg no-print ${
                        detail.isCorrect
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-rose-50 text-rose-800'
                      }`}
                    >
                      <strong>
                        {detail.isCorrect ? 'Đúng (+0,5đ)' : `Chưa đúng (Đáp án: ${q.displayAnswer})`}:
                      </strong>{' '}
                      <MathRenderer text={q.explanation} />
                    </div>
                  )}

                  {isAnswerKey && (
                    <div className="text-xs bg-emerald-50/70 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-emerald-950">
                      <strong>Giải thích:</strong> <MathRenderer text={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* B. TỰ LUẬN (3,0 điểm) */}
      <section className="space-y-5">
        <SectionHeader
          title="B. TỰ LUẬN (3,0 điểm)"
          subtitle="Nhập kết quả hoặc kết luận ngắn gọn từ Bài 1 đến Bài 3 (không cần trình bày lời giải chi tiết). Có thể nhập phân số dạng a/b (VD: 3/5, -1/2)."
        />

        {/* Bài 1 (1,0 điểm) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
          <div className="flex flex-wrap items-start gap-2.5">
            <QuestionBadge label="Bài 1" pointsText="1,0 điểm" />
            <div className="flex-1 text-[15px] font-medium leading-relaxed">
              <MathRenderer text={exam.part4Essay.bai1.stem} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exam.part4Essay.bai1.parts.map((part) => (
              <div
                key={part.label}
                className="rounded-xl border border-dashed border-sky-300 bg-sky-50/20 p-3 text-[15px]"
              >
                <span className="font-bold text-sky-900">{part.label})</span>{' '}
                <MathRenderer text={part.prompt} />
                <span className="ml-1.5 text-xs italic text-slate-500">
                  ({formatScoreVi(part.points || 0.5)}đ)
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-300 bg-slate-50/40 p-4 space-y-3">
            <div className="text-center font-bold underline underline-offset-4">Bài giải</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exam.part4Essay.bai1.parts.map((part) => (
                <div
                  key={part.label}
                  className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
                >
                  <div className="text-sm font-bold text-sky-900">Câu {part.label})</div>
                  {isPractice ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold whitespace-nowrap">
                        Kết quả {part.label} =
                      </span>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={answers.bai1Result[part.label] ?? ''}
                        onChange={(e) =>
                          onChangeAnswers((prev) => ({
                            ...prev,
                            bai1Result: { ...prev.bai1Result, [part.label]: e.target.value },
                          }))
                        }
                        placeholder="Nhập đáp số..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  ) : isWorksheet ? (
                    <>
                      <DottedLines count={4} />
                      <div className="text-sm font-semibold text-slate-700 pt-1">
                        Kết quả {part.label} = ..................................
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-sm space-y-1">
                      {part.solutionSteps.map((s, idx) => (
                        <div key={idx}>
                          <MathRenderer text={s} />
                        </div>
                      ))}
                      <div className="font-bold text-emerald-900 pt-1">
                        Kết quả {part.label} = <MathRenderer text={part.result} /> (0,5đ)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('bai1')} />}
        </div>

        {/* Bài 2 (1,0 điểm) - Hình học */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
          <div className="flex flex-wrap items-start gap-2.5">
            <QuestionBadge label="Bài 2" pointsText="1,0 điểm" />
            <div className="flex-1 text-[15px] font-medium leading-relaxed">
              <MathRenderer text={exam.part4Essay.bai2.stem} />
            </div>
          </div>

          <MathSvg svg={exam.part4Essay.bai2.svg} />

          <div className="space-y-1.5 text-[15px]">
            {exam.part4Essay.bai2.parts.map((part) => (
              <div key={part.label}>
                <strong className="text-sky-900">{part.label})</strong>{' '}
                <MathRenderer text={part.prompt} />{' '}
                <span className="italic text-xs text-slate-500">
                  ({formatScoreVi(part.points || 0.5)} điểm)
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-300 bg-slate-50/40 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exam.part4Essay.bai2.parts.map((part) => (
                <div key={part.label} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <div className="text-sm font-bold text-sky-900">Ý {part.label})</div>
                  {isPractice ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-700 whitespace-nowrap">
                        Kết luận / Đáp số:
                      </span>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={answers.bai2Work[part.label] ?? ''}
                        onChange={(e) =>
                          onChangeAnswers((prev) => ({
                            ...prev,
                            bai2Work: { ...prev.bai2Work, [part.label]: e.target.value },
                          }))
                        }
                        placeholder="VD: 120° hoặc ABM = ACM..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  ) : isWorksheet ? (
                    <DottedLines count={4} />
                  ) : (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-sm space-y-1">
                      {part.solutionSteps.map((s, idx) => (
                        <div key={idx}>
                          <MathRenderer text={s} />
                        </div>
                      ))}
                      <div className="font-bold text-emerald-900 pt-1">
                        Kết luận: <MathRenderer text={part.finalConclusion} /> (0,5đ)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('bai2')} />}
        </div>

        {/* Bài 3 (1,0 điểm) - Bài toán thực tế */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 print-avoid-break">
          <div className="flex flex-wrap items-start gap-2.5">
            <QuestionBadge label="Bài 3" pointsText="1,0 điểm" />
            <div className="flex-1 text-[15px] font-medium leading-relaxed">
              <MathRenderer text={exam.part4Essay.bai3.stem} />
            </div>
          </div>

          {exam.part4Essay.bai3.svg && <MathSvg svg={exam.part4Essay.bai3.svg} />}

          <div className="rounded-xl border border-slate-300 bg-slate-50/40 p-4 space-y-3">
            {isPractice ? (
              exam.part4Essay.bai3.conclusionPrompts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exam.part4Essay.bai3.conclusionPrompts.map((cp, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-700 whitespace-nowrap">
                        <MathRenderer text={cp.label} />
                      </span>
                      <input
                        type="text"
                        disabled={isLocked}
                        value={answers.bai3Conclusions[idx] ?? ''}
                        onChange={(e) =>
                          onChangeAnswers((prev) => ({
                            ...prev,
                            bai3Conclusions: {
                              ...prev.bai3Conclusions,
                              [idx]: e.target.value,
                            },
                          }))
                        }
                        placeholder="Nhập đáp số..."
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-700 whitespace-nowrap">Đáp số:</span>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={answers.bai3Work}
                    onChange={(e) =>
                      onChangeAnswers((prev) => ({ ...prev, bai3Work: e.target.value }))
                    }
                    placeholder="Nhập đáp số cuối cùng..."
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono-math focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )
            ) : isWorksheet ? (
              <>
                <DottedLines count={5} />
                {exam.part4Essay.bai3.conclusionPrompts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {exam.part4Essay.bai3.conclusionPrompts.map((cp, idx) => (
                      <div key={idx} className="text-sm font-semibold text-slate-700">
                        <MathRenderer text={cp.label} /> ..............................
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm space-y-1.5">
                {exam.part4Essay.bai3.solutionSteps.map((s, idx) => (
                  <div key={idx}>
                    <MathRenderer text={s} />
                  </div>
                ))}
                <div className="font-bold text-emerald-900 pt-1">
                  Đáp số: <MathRenderer text={exam.part4Essay.bai3.finalAnswer} />
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-200 text-xs text-slate-700 space-y-0.5">
                  <strong>Thang điểm:</strong>
                  {exam.part4Essay.bai3.rubric.map((r, rIdx) => (
                    <div key={rIdx}>• {r}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {isPractice && <EssayFeedbackCard feedback={findEssayFeedback('bai3')} />}
        </div>
      </section>
    </div>
  );
};
