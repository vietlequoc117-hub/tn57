import React from 'react';
import type { ExamData } from '../types/exam.ts';
import { MathRenderer } from './MathRenderer.tsx';

export const QuickAnswerKeyTable: React.FC<{ exam: ExamData }> = ({ exam }) => {
  if (exam.grade === 5) {
    return (
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 print-avoid-break">
        <div className="text-sm font-bold text-emerald-950">
          Bảng đáp án nhanh — Phần Trắc nghiệm (4,0 điểm) & Điền khuyết Câu 1 (1,0 điểm)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-emerald-200 bg-white text-sm text-center">
            <thead>
              <tr className="bg-emerald-100/70 text-emerald-950">
                {exam.multipleChoice.map((q) => (
                  <th key={q.id} className="border border-emerald-200 px-2 py-1.5 font-semibold">
                    Câu {q.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {exam.multipleChoice.map((q) => (
                  <td key={q.id} className="border border-emerald-200 px-2 py-1.5 font-bold text-emerald-800">
                    {q.correctOption}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-emerald-950">
          {exam.essay.q1.items.map((it) => (
            <div key={it.label} className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5">
              <strong>1{it.label}:</strong> <MathRenderer text={it.answer} />{' '}
              {it.unit ? it.unit : ''}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 print-avoid-break">
      <div className="text-sm font-bold text-emerald-950">
        Bảng đáp án nhanh — Trắc nghiệm (7,0 điểm)
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-emerald-200 bg-white text-xs text-center">
          <thead>
            <tr className="bg-emerald-100/70 text-emerald-950">
              {exam.part1MultipleChoice.map((q) => (
                <th key={q.id} className="border border-emerald-200 px-1.5 py-1 font-semibold">
                  C{q.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {exam.part1MultipleChoice.map((q) => (
                <td key={q.id} className="border border-emerald-200 px-1.5 py-1.5 font-bold text-emerald-800">
                  {q.correctOption}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {exam.part2TrueFalse.map((tf) => (
          <div key={tf.id} className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
            <strong className="text-emerald-900">Câu {tf.id} (Đ/S):</strong>{' '}
            {tf.statements.map((s) => `${s.label}) ${s.isTrue ? 'Đ' : 'S'}`).join(' · ')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {exam.part3ShortAnswer.map((sa) => (
          <div key={sa.id} className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5">
            <strong className="text-emerald-900">Câu {sa.id}:</strong>{' '}
            <MathRenderer text={sa.displayAnswer} />
          </div>
        ))}
      </div>
    </div>
  );
};
