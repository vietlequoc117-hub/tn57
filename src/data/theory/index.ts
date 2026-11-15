import type { GradeLevel } from '../curriculum.ts';
import { GRADE_5_THEORY } from './grade5Theory.ts';
import { GRADE_7_THEORY } from './grade7Theory.ts';

export function getWeekTheory(grade: GradeLevel, week: number): string[] {
  const bank = grade === 5 ? GRADE_5_THEORY : GRADE_7_THEORY;
  return bank[week] ?? [];
}
