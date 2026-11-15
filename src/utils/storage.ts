import type { ExamDifficulty, GradeLevel } from '../data/curriculum.ts';
import type { ExamData, SavedExamRecord, ScoreHistoryEntry } from '../types/exam.ts';

const SAVED_EXAMS_KEY = 'toan_kntt_saved_exams_v1';
const SCORE_HISTORY_KEY = 'toan_kntt_score_history_v1';

export function getSavedExams(): SavedExamRecord[] {
  try {
    const raw = localStorage.getItem(SAVED_EXAMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedExamRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveExamRecord(exam: ExamData): SavedExamRecord {
  const existing = getSavedExams();
  const record: SavedExamRecord = {
    id: `${exam.grade}-w${exam.week}-${exam.level}-${Date.now()}`,
    grade: exam.grade,
    week: exam.week,
    level: exam.level,
    createdAt: new Date().toISOString(),
    exam,
  };
  // Keep up to 70 recent exams in localStorage
  const next = [record, ...existing].slice(0, 70);
  try {
    localStorage.setItem(SAVED_EXAMS_KEY, JSON.stringify(next));
  } catch {
    // If quota exceeded, keep latest 25
    localStorage.setItem(SAVED_EXAMS_KEY, JSON.stringify(next.slice(0, 25)));
  }
  return record;
}

export function findLatestExamForConfig(
  grade: GradeLevel,
  week: number,
  level: ExamDifficulty,
): SavedExamRecord | undefined {
  return getSavedExams().find(
    (item) => item.grade === grade && item.week === week && item.level === level,
  );
}

export function deleteSavedExam(id: string): SavedExamRecord[] {
  const next = getSavedExams().filter((item) => item.id !== id);
  localStorage.setItem(SAVED_EXAMS_KEY, JSON.stringify(next));
  return next;
}

export function getScoreHistory(): ScoreHistoryEntry[] {
  try {
    const raw = localStorage.getItem(SCORE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScoreHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveScoreEntry(entry: ScoreHistoryEntry): ScoreHistoryEntry[] {
  const existing = getScoreHistory();
  const next = [entry, ...existing].slice(0, 50);
  localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function clearScoreHistory(): void {
  localStorage.removeItem(SCORE_HISTORY_KEY);
}
