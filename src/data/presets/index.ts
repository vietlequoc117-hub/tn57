import type { GradeLevel } from '../curriculum.ts';
import type { ExamData, SavedExamRecord } from '../../types/exam.ts';
import { GRADE_5_PRESET_EXAMS, GRADE_5_PRESET_EXAMS_SET2 } from './grade5Presets.ts';
import { GRADE_7_PRESET_EXAMS, GRADE_7_PRESET_EXAMS_SET2 } from './grade7Presets.ts';

export {
  GRADE_5_PRESET_EXAMS,
  GRADE_5_PRESET_EXAMS_SET2,
  GRADE_7_PRESET_EXAMS,
  GRADE_7_PRESET_EXAMS_SET2,
};

export function getPresetExam(
  grade: GradeLevel,
  week: number,
  presetNumber: 1 | 2 = 1,
): ExamData | null {
  const bank =
    grade === 5
      ? presetNumber === 2
        ? GRADE_5_PRESET_EXAMS_SET2
        : GRADE_5_PRESET_EXAMS
      : presetNumber === 2
        ? GRADE_7_PRESET_EXAMS_SET2
        : GRADE_7_PRESET_EXAMS;
  return bank[week] ?? null;
}

export function getPresetExamRecord(
  grade: GradeLevel,
  week: number,
  presetNumber: 1 | 2 = 1,
): SavedExamRecord | null {
  const exam = getPresetExam(grade, week, presetNumber);
  if (!exam) return null;
  const suffix = presetNumber === 2 ? '-v2' : '';
  return {
    id: `preset-g${grade}-w${week}${suffix}`,
    grade,
    week,
    level: 'standard',
    createdAt: '2026-01-01T00:00:00.000Z',
    exam,
  };
}

