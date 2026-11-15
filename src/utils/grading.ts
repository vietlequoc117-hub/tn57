import type {
  Grade5Exam,
  Grade5StudentAnswers,
  Grade7Exam,
  Grade7StudentAnswers,
} from '../types/exam.ts';
import { isMathAnswerMatch } from './mathFormat.ts';

export interface ObjectiveGradeOutput {
  objectiveEarnedPoints: number;
  objectiveMaxPoints: number;
  objectiveDetails: Record<
    string,
    {
      isCorrect: boolean;
      earned: number;
      max: number;
      userAnswer: string;
      correctAnswer: string;
    }
  >;
}

export function createEmptyGrade5Answers(): Grade5StudentAnswers {
  return {
    mc: {},
    q1: { a: '', b: '', c: '', d: '' },
    q2aWork: {},
    q2aResult: {},
    q2bWork: {},
    q2bResult: {},
    q3: { a: '', b: '' },
    q4Work: '',
    q4Answer: '',
    q5Work: '',
    q5Answer: '',
  };
}

export function createEmptyGrade7Answers(): Grade7StudentAnswers {
  return {
    mc: {},
    tf: {
      13: { a: undefined, b: undefined, c: undefined, d: undefined },
      14: { a: undefined, b: undefined, c: undefined, d: undefined },
    },
    short: {},
    bai1Work: { a: '', b: '' },
    bai1Result: { a: '', b: '' },
    bai2Work: { a: '', b: '' },
    bai3Work: '',
    bai3Conclusions: {},
  };
}

export function gradeGrade5Objective(
  exam: Grade5Exam,
  answers: Grade5StudentAnswers,
): ObjectiveGradeOutput {
  const details: ObjectiveGradeOutput['objectiveDetails'] = {};
  let earned = 0;
  let max = 0;

  // I. Multiple Choice (8 * 0.5 = 4.0)
  for (const q of exam.multipleChoice) {
    const pts = q.points || 0.5;
    max += pts;
    const chosen = answers.mc[q.id];
    const isCorrect = chosen === q.correctOption;
    const qEarned = isCorrect ? pts : 0;
    earned += qEarned;
    details[`mc_${q.id}`] = {
      isCorrect,
      earned: qEarned,
      max: pts,
      userAnswer: chosen ?? 'Chưa chọn',
      correctAnswer: q.correctOption,
    };
  }

  // II. Question 1 fill-in-the-blank (4 * 0.25 = 1.0)
  for (const item of exam.essay.q1.items) {
    const pts = item.points || 0.25;
    max += pts;
    const userVal = answers.q1[item.label] ?? '';
    const candidates = [item.answer, ...(item.acceptedAnswers || [])];
    const isCorrect = isMathAnswerMatch(userVal, candidates);
    const qEarned = isCorrect ? pts : 0;
    earned += qEarned;
    details[`q1_${item.label}`] = {
      isCorrect,
      earned: qEarned,
      max: pts,
      userAnswer: userVal || 'Trống',
      correctAnswer: item.answer,
    };
  }

  return {
    objectiveEarnedPoints: Math.round(earned * 100) / 100,
    objectiveMaxPoints: Math.round(max * 100) / 100,
    objectiveDetails: details,
  };
}

export function gradeGrade7Objective(
  exam: Grade7Exam,
  answers: Grade7StudentAnswers,
): ObjectiveGradeOutput {
  const details: ObjectiveGradeOutput['objectiveDetails'] = {};
  let earned = 0;
  let max = 0;

  // Part 1: 12 MCQs * 0.25 = 3.0
  for (const q of exam.part1MultipleChoice) {
    const pts = q.points || 0.25;
    max += pts;
    const chosen = answers.mc[q.id];
    const isCorrect = chosen === q.correctOption;
    const qEarned = isCorrect ? pts : 0;
    earned += qEarned;
    details[`mc_${q.id}`] = {
      isCorrect,
      earned: qEarned,
      max: pts,
      userAnswer: chosen ?? 'Chưa chọn',
      correctAnswer: q.correctOption,
    };
  }

  // Part 2: 2 True/False questions * 4 statements * 0.25 = 2.0
  for (const tfQ of exam.part2TrueFalse) {
    const studentMap = answers.tf[tfQ.id] || {};
    for (const stmt of tfQ.statements) {
      const pts = stmt.points || 0.25;
      max += pts;
      const chosen = studentMap[stmt.label];
      const isCorrect = chosen === stmt.isTrue;
      const qEarned = isCorrect ? pts : 0;
      earned += qEarned;
      details[`tf_${tfQ.id}_${stmt.label}`] = {
        isCorrect,
        earned: qEarned,
        max: pts,
        userAnswer: chosen === undefined ? 'Chưa chọn' : chosen ? 'Đúng' : 'Sai',
        correctAnswer: stmt.isTrue ? 'Đúng' : 'Sai',
      };
    }
  }

  // Part 3: 4 Short Answer * 0.5 = 2.0
  for (const saQ of exam.part3ShortAnswer) {
    const pts = saQ.points || 0.5;
    max += pts;
    const userVal = answers.short[saQ.id] ?? '';
    const candidates = [saQ.displayAnswer, ...(saQ.acceptedAnswers || [])];
    const isCorrect = isMathAnswerMatch(userVal, candidates);
    const qEarned = isCorrect ? pts : 0;
    earned += qEarned;
    details[`short_${saQ.id}`] = {
      isCorrect,
      earned: qEarned,
      max: pts,
      userAnswer: userVal || 'Trống',
      correctAnswer: saQ.displayAnswer,
    };
  }

  return {
    objectiveEarnedPoints: Math.round(earned * 100) / 100,
    objectiveMaxPoints: Math.round(max * 100) / 100,
    objectiveDetails: details,
  };
}
