import type { Grade7Exam } from '../../types/exam.ts';
import { buildGrade7Exam } from './grade7Types.ts';
import { GRADE_7_W1_TO_9 } from './grade7DataW1to9.ts';
import { GRADE_7_W10_TO_18 } from './grade7DataW10to18.ts';
import { GRADE_7_W19_TO_27 } from './grade7DataW19to27.ts';
import { GRADE_7_W28_TO_35 } from './grade7DataW28to35.ts';

const ALL_GRADE_7_SPECS = [
  ...GRADE_7_W1_TO_9,
  ...GRADE_7_W10_TO_18,
  ...GRADE_7_W19_TO_27,
  ...GRADE_7_W28_TO_35,
];

export const GRADE_7_PRESET_EXAMS: Record<number, Grade7Exam> = Object.fromEntries(
  ALL_GRADE_7_SPECS.map((spec) => [spec.week, buildGrade7Exam(spec)]),
);
