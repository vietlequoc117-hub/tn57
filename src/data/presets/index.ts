import type { GradeLevel } from '../curriculum.ts';
import type { ExamData, SavedExamRecord } from '../../types/exam.ts';
import { GRADE_5_PRESET_EXAMS } from './grade5Presets.ts';
import { GRADE_7_PRESET_EXAMS } from './grade7Presets.ts';

export { GRADE_5_PRESET_EXAMS, GRADE_7_PRESET_EXAMS };

export function getPresetExam(grade: GradeLevel, week: number): ExamData | null {
  const bank = grade === 5 ? GRADE_5_PRESET_EXAMS : GRADE_7_PRESET_EXAMS;
  return bank[week] ?? null;
}

export function getPresetExamRecord(grade: GradeLevel, week: number): SavedExamRecord | null {
  const exam = getPresetExam(grade, week);
  if (!exam) return null;
  return {
    id: `preset-g${grade}-w${week}`,
    grade,
    week,
    level: 'standard',
    createdAt: '2026-01-01T00:00:00.000Z',
    exam,
  };
}
