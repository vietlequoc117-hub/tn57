import type { Grade5Exam } from '../../types/exam.ts';
import { buildGrade5Exam } from './grade5Types.ts';
import { GRADE_5_W1_TO_9 } from './grade5DataW1to9.ts';
import { GRADE_5_W10_TO_18 } from './grade5DataW10to18.ts';
import { GRADE_5_W19_TO_27 } from './grade5DataW19to27.ts';
import { GRADE_5_W28_TO_35 } from './grade5DataW28to35.ts';
import { GRADE_5_SET2_W1_TO_9 } from './grade5Set2DataW1to9.ts';
import { GRADE_5_SET2_W10_TO_18 } from './grade5Set2DataW10to18.ts';
import { GRADE_5_SET2_W19_TO_27 } from './grade5Set2DataW19to27.ts';
import { GRADE_5_SET2_W28_TO_35 } from './grade5Set2DataW28to35.ts';

const ALL_GRADE_5_SPECS = [
  ...GRADE_5_W1_TO_9,
  ...GRADE_5_W10_TO_18,
  ...GRADE_5_W19_TO_27,
  ...GRADE_5_W28_TO_35,
];

const ALL_GRADE_5_SET2_SPECS = [
  ...GRADE_5_SET2_W1_TO_9,
  ...GRADE_5_SET2_W10_TO_18,
  ...GRADE_5_SET2_W19_TO_27,
  ...GRADE_5_SET2_W28_TO_35,
];

export const GRADE_5_PRESET_EXAMS: Record<number, Grade5Exam> = Object.fromEntries(
  ALL_GRADE_5_SPECS.map((spec) => [spec.week, buildGrade5Exam(spec, 1)]),
);

export const GRADE_5_PRESET_EXAMS_SET2: Record<number, Grade5Exam> = Object.fromEntries(
  ALL_GRADE_5_SET2_SPECS.map((spec) => [spec.week, buildGrade5Exam(spec, 2)]),
);

