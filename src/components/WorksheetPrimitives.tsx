import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { EssayItemFeedback, GradingResult } from '../types/exam.ts';
import { formatDuration, formatScoreVi } from '../utils/mathFormat.ts';

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <div className="bg-sky-100 text-sky-900 rounded-xl px-4 py-2.5 font-bold text-base sm:text-lg print-avoid-break">
    <div>{title}</div>
    {subtitle && (
      <div className="text-sm font-normal italic text-sky-800 mt-0.5">{subtitle}</div>
    )}
  </div>
);

export const QuestionBadge: React.FC<{ label: string; pointsText: string }> = ({
  label,
  pointsText,
}) => (
  <span className="inline-flex items-center gap-2 shrink-0">
    <span className="inline-block bg-pink-100 text-pink-700 border border-pink-300 rounded-lg px-2.5 py-0.5 font-bold text-sm whitespace-nowrap">
      {label}
    </span>
    <span className="italic text-sm text-slate-500 whitespace-nowrap">({pointsText})</span>
  </span>
);

export const DottedLines: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="space-y-1.5 py-1">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="dotted-write-line w-full" />
    ))}
  </div>
);

export const GradingSummaryBanner: React.FC<{
  result: GradingResult;
  elapsedSeconds: number;
  onResetAttempt: () => void;
}> = ({ result, elapsedSeconds, onResetAttempt }) => {
  const isGood = result.totalScore >= 8;
  const isPass = result.totalScore >= 5;

  return (
    <div
      className={`mb-6 rounded-2xl border p-5 no-print ${
        isGood
          ? 'bg-emerald-50/70 border-emerald-200'
          : isPass
            ? 'bg-sky-50/70 border-sky-200'
            : 'bg-amber-50/70 border-amber-200'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            {isPass ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <span>Kết quả chấm bài</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-math tabular-nums text-slate-600">
              Thời gian: {formatDuration(elapsedSeconds)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-6">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatScoreVi(result.totalScore)}
              </span>
              <span className="text-base font-semibold text-slate-500"> / 10 điểm</span>
            </div>
            <div className="text-sm text-slate-700 flex flex-wrap gap-4 tabular-nums">
              <span>
                Phần tự động:{' '}
                <strong className="text-slate-900">
                  {formatScoreVi(result.objectiveEarnedPoints)} /{' '}
                  {formatScoreVi(result.objectiveMaxPoints)}đ
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Phần tự luận AI:{' '}
                <strong className="text-slate-900">
                  {formatScoreVi(result.essayEarnedPoints)} /{' '}
                  {formatScoreVi(result.essayMaxPoints)}đ
                </strong>
              </span>
            </div>
          </div>
          {result.essayResult?.overallComment && (
            <p className="mt-3 text-sm text-slate-700 leading-relaxed bg-white/80 rounded-xl border border-slate-200/80 p-3">
              <strong className="text-slate-900">Nhận xét chung: </strong>
              {result.essayResult.overallComment}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onResetAttempt}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Làm lại bài này
        </button>
      </div>
    </div>
  );
};

export const EssayFeedbackCard: React.FC<{ feedback?: EssayItemFeedback }> = ({ feedback }) => {
  if (!feedback) return null;
  const fullCredit = feedback.earnedPoints >= feedback.maxPoints;
  return (
    <div
      className={`mt-3 rounded-xl border p-3.5 text-sm no-print ${
        fullCredit
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : feedback.earnedPoints > 0
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : 'bg-rose-50/80 border-rose-200 text-rose-950'
      }`}
    >
      <div className="flex items-center justify-between gap-2 font-semibold">
        <span>Chấm tự luận: {feedback.title}</span>
        <span className="font-mono-math tabular-nums">
          {formatScoreVi(feedback.earnedPoints)} / {formatScoreVi(feedback.maxPoints)} điểm
        </span>
      </div>
      <p className="mt-1.5 leading-relaxed">{feedback.feedback}</p>
      {feedback.errorsFound && (
        <p className="mt-1 text-xs text-rose-800">
          <strong>Chỗ cần lưu ý:</strong> {feedback.errorsFound}
        </p>
      )}
      {feedback.suggestion && (
        <p className="mt-1 text-xs text-slate-700">
          <strong>Gợi ý:</strong> {feedback.suggestion}
        </p>
      )}
    </div>
  );
};
