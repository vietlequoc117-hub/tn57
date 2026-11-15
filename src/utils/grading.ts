import type {
  EssayGradingResponse,
  EssayItemFeedback,
  Grade5Exam,
  Grade5StudentAnswers,
  Grade7Exam,
  Grade7StudentAnswers,
} from '../types/exam.ts';
import { formatScoreVi, isFlexibleAnswerMatch } from './mathFormat.ts';

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
    const isCorrect = isFlexibleAnswerMatch(userVal, candidates);
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
    const isCorrect = isFlexibleAnswerMatch(userVal, candidates);
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

function roundPoints(val: number): number {
  return Math.round(val * 100) / 100;
}

export function gradeGrade5EssayLocal(
  exam: Grade5Exam,
  answers: Grade5StudentAnswers,
): EssayGradingResponse {
  const items: EssayItemFeedback[] = [];

  // Câu 2a (1,0đ: 2 ý * 0,5đ)
  let q2aEarned = 0;
  let q2aMax = 0;
  const q2aCorrectLabels: string[] = [];
  const q2aWrongNotes: string[] = [];
  exam.essay.q2.partA.items.forEach((item, idx) => {
    const pts = item.points || 0.5;
    q2aMax += pts;
    const userVal = (answers.q2aResult[item.id] ?? '').trim();
    const ok = isFlexibleAnswerMatch(userVal, [item.result]);
    const label = `Phép tính ${idx + 1}`;
    if (ok) {
      q2aEarned += pts;
      q2aCorrectLabels.push(`${label} (+${formatScoreVi(pts)}đ)`);
    } else {
      q2aWrongNotes.push(
        `${label}: bạn nhập "${userVal || 'trống'}", đáp án đúng là "${item.result}"`,
      );
    }
  });
  items.push({
    itemId: 'q2a',
    title: 'Câu 2a (Đặt tính rồi tính)',
    maxPoints: roundPoints(q2aMax || 1),
    earnedPoints: roundPoints(q2aEarned),
    isCorrect: q2aEarned >= (q2aMax || 1),
    feedback:
      q2aWrongNotes.length === 0
        ? `Chính xác hoàn toàn: ${q2aCorrectLabels.join('; ')}.`
        : q2aCorrectLabels.length > 0
          ? `Đúng ${q2aCorrectLabels.join('; ')}.`
          : 'Chưa trùng khớp với đáp án chuẩn.',
    errorsFound: q2aWrongNotes.length > 0 ? q2aWrongNotes.join(' | ') : undefined,
  });

  // Câu 2b (1,0đ: 2 ý * 0,5đ)
  let q2bEarned = 0;
  let q2bMax = 0;
  const q2bCorrectLabels: string[] = [];
  const q2bWrongNotes: string[] = [];
  exam.essay.q2.partB.items.forEach((item, idx) => {
    const pts = item.points || 0.5;
    q2bMax += pts;
    const userVal = (answers.q2bResult[item.id] ?? '').trim();
    const ok = isFlexibleAnswerMatch(userVal, [item.result]);
    const label = `Ý ${idx + 1}`;
    if (ok) {
      q2bEarned += pts;
      q2bCorrectLabels.push(`${label} (+${formatScoreVi(pts)}đ)`);
    } else {
      q2bWrongNotes.push(
        `${label}: bạn nhập "${userVal || 'trống'}", đáp án đúng là "${item.result}"`,
      );
    }
  });
  items.push({
    itemId: 'q2b',
    title: 'Câu 2b (Tính thuận tiện)',
    maxPoints: roundPoints(q2bMax || 1),
    earnedPoints: roundPoints(q2bEarned),
    isCorrect: q2bEarned >= (q2bMax || 1),
    feedback:
      q2bWrongNotes.length === 0
        ? `Chính xác hoàn toàn: ${q2bCorrectLabels.join('; ')}.`
        : q2bCorrectLabels.length > 0
          ? `Đúng ${q2bCorrectLabels.join('; ')}.`
          : 'Chưa trùng khớp với đáp án chuẩn.',
    errorsFound: q2bWrongNotes.length > 0 ? q2bWrongNotes.join(' | ') : undefined,
  });

  // Câu 3 (1,0đ: a, b * 0,5đ)
  let q3Earned = 0;
  let q3Max = 0;
  const q3CorrectLabels: string[] = [];
  const q3WrongNotes: string[] = [];
  for (const item of exam.essay.q3.items) {
    const pts = item.points || 0.5;
    q3Max += pts;
    const userVal = (answers.q3[item.label] ?? '').trim();
    const ok = isFlexibleAnswerMatch(userVal, [item.answer]);
    if (ok) {
      q3Earned += pts;
      q3CorrectLabels.push(`Ý ${item.label}) (+${formatScoreVi(pts)}đ)`);
    } else {
      q3WrongNotes.push(
        `Ý ${item.label}): bạn nhập "${userVal || 'trống'}", đáp án đúng là "${item.answer}"`,
      );
    }
  }
  items.push({
    itemId: 'q3',
    title: 'Câu 3 (Đọc bảng/biểu đồ hoặc quy đổi)',
    maxPoints: roundPoints(q3Max || 1),
    earnedPoints: roundPoints(q3Earned),
    isCorrect: q3Earned >= (q3Max || 1),
    feedback:
      q3WrongNotes.length === 0
        ? `Chính xác hoàn toàn: ${q3CorrectLabels.join('; ')}.`
        : q3CorrectLabels.length > 0
          ? `Đúng ${q3CorrectLabels.join('; ')}.`
          : 'Chưa trùng khớp với đáp án chuẩn.',
    errorsFound: q3WrongNotes.length > 0 ? q3WrongNotes.join(' | ') : undefined,
  });

  // Câu 4 (1,5đ)
  const q4Max = exam.essay.q4.points || 1.5;
  const q4User = (answers.q4Answer || answers.q4Work || '').trim();
  const q4Ok = isFlexibleAnswerMatch(q4User, [exam.essay.q4.finalAnswer]);
  const q4Earned = q4Ok ? q4Max : 0;
  items.push({
    itemId: 'q4',
    title: 'Câu 4 (Bài toán có lời văn)',
    maxPoints: q4Max,
    earnedPoints: q4Earned,
    isCorrect: q4Ok,
    feedback: q4Ok
      ? `Chính xác! Đáp số "${exam.essay.q4.finalAnswer}" khớp hoàn toàn (+${formatScoreVi(q4Max)}đ).`
      : q4User
        ? `Đáp số "${q4User}" chưa đúng.`
        : 'Bạn chưa nhập đáp số cho câu này.',
    errorsFound: q4Ok ? undefined : `Đáp án chuẩn: ${exam.essay.q4.finalAnswer}`,
    suggestion: q4Ok ? undefined : exam.essay.q4.solutionSteps[0],
  });

  // Câu 5 (0,5đ)
  const q5Max = exam.essay.q5.points || 0.5;
  const q5User = (answers.q5Answer || answers.q5Work || '').trim();
  const q5Ok = isFlexibleAnswerMatch(q5User, [exam.essay.q5.finalAnswer]);
  const q5Earned = q5Ok ? q5Max : 0;
  items.push({
    itemId: 'q5',
    title: 'Câu 5 (Vận dụng nâng cao)',
    maxPoints: q5Max,
    earnedPoints: q5Earned,
    isCorrect: q5Ok,
    feedback: q5Ok
      ? `Chính xác! Đáp số "${exam.essay.q5.finalAnswer}" khớp hoàn toàn (+${formatScoreVi(q5Max)}đ).`
      : q5User
        ? `Đáp số "${q5User}" chưa đúng.`
        : 'Bạn chưa nhập đáp số cho câu này.',
    errorsFound: q5Ok ? undefined : `Đáp án chuẩn: ${exam.essay.q5.finalAnswer}`,
    suggestion: q5Ok ? undefined : exam.essay.q5.solutionSteps[0],
  });

  const essayEarnedPoints = roundPoints(items.reduce((sum, it) => sum + it.earnedPoints, 0));
  const essayMaxPoints = roundPoints(items.reduce((sum, it) => sum + it.maxPoints, 0));
  const correctCount = items.filter((it) => it.isCorrect).length;

  return {
    essayEarnedPoints,
    essayMaxPoints,
    overallComment: `Hệ thống đã đối chiếu đáp án chuẩn: đạt ${formatScoreVi(essayEarnedPoints)}/${formatScoreVi(essayMaxPoints)} điểm phần II (${correctCount}/${items.length} câu đúng trọn vẹn). Xem tab Đáp án & Hướng dẫn chấm để đối chiếu lời giải chi tiết.`,
    items,
  };
}

export function gradeGrade7EssayLocal(
  exam: Grade7Exam,
  answers: Grade7StudentAnswers,
): EssayGradingResponse {
  const items: EssayItemFeedback[] = [];

  // Bài 1 (1,0đ: a, b * 0,5đ)
  let b1Earned = 0;
  let b1Max = 0;
  const b1Correct: string[] = [];
  const b1Wrong: string[] = [];
  for (const part of exam.part4Essay.bai1.parts) {
    const pts = part.points || 0.5;
    b1Max += pts;
    const userVal = (answers.bai1Result[part.label] ?? '').trim();
    const ok = isFlexibleAnswerMatch(userVal, [part.result]);
    if (ok) {
      b1Earned += pts;
      b1Correct.push(`Ý ${part.label}) (+${formatScoreVi(pts)}đ)`);
    } else {
      b1Wrong.push(
        `Ý ${part.label}): bạn nhập "${userVal || 'trống'}", đáp án đúng là "${part.result}"`,
      );
    }
  }
  items.push({
    itemId: 'bai1',
    title: 'Bài 1 (Đại số)',
    maxPoints: roundPoints(b1Max || 1),
    earnedPoints: roundPoints(b1Earned),
    isCorrect: b1Earned >= (b1Max || 1),
    feedback:
      b1Wrong.length === 0
        ? `Chính xác hoàn toàn: ${b1Correct.join('; ')}.`
        : b1Correct.length > 0
          ? `Đúng ${b1Correct.join('; ')}.`
          : 'Chưa trùng khớp với đáp án chuẩn.',
    errorsFound: b1Wrong.length > 0 ? b1Wrong.join(' | ') : undefined,
  });

  // Bài 2 (1,0đ: a, b * 0,5đ)
  let b2Earned = 0;
  let b2Max = 0;
  const b2Correct: string[] = [];
  const b2Wrong: string[] = [];
  for (const part of exam.part4Essay.bai2.parts) {
    const pts = part.points || 0.5;
    b2Max += pts;
    const userVal = (answers.bai2Work[part.label] ?? '').trim();
    const ok = isFlexibleAnswerMatch(userVal, [part.finalConclusion]);
    if (ok) {
      b2Earned += pts;
      b2Correct.push(`Ý ${part.label}) (+${formatScoreVi(pts)}đ)`);
    } else {
      b2Wrong.push(
        `Ý ${part.label}): bạn nhập "${userVal || 'trống'}", đáp án đúng là "${part.finalConclusion}"`,
      );
    }
  }
  items.push({
    itemId: 'bai2',
    title: 'Bài 2 (Hình học / Thống kê)',
    maxPoints: roundPoints(b2Max || 1),
    earnedPoints: roundPoints(b2Earned),
    isCorrect: b2Earned >= (b2Max || 1),
    feedback:
      b2Wrong.length === 0
        ? `Chính xác hoàn toàn: ${b2Correct.join('; ')}.`
        : b2Correct.length > 0
          ? `Đúng ${b2Correct.join('; ')}.`
          : 'Chưa trùng khớp với đáp án chuẩn.',
    errorsFound: b2Wrong.length > 0 ? b2Wrong.join(' | ') : undefined,
  });

  // Bài 3 (1,0đ: conclusionPrompts hoặc finalAnswer)
  const b3Max = exam.part4Essay.bai3.points || 1;
  const prompts = exam.part4Essay.bai3.conclusionPrompts;
  let b3Earned = 0;
  let b3Feedback = '';
  let b3Errors: string | undefined;

  if (prompts.length > 0) {
    const perPrompt = b3Max / prompts.length;
    const b3Correct: string[] = [];
    const b3Wrong: string[] = [];
    prompts.forEach((cp, idx) => {
      const userVal = (answers.bai3Conclusions[idx] ?? '').trim();
      const ok = isFlexibleAnswerMatch(userVal, [cp.answer]);
      if (ok) {
        b3Earned += perPrompt;
        b3Correct.push(`${cp.label} (+${formatScoreVi(perPrompt)}đ)`);
      } else {
        b3Wrong.push(
          `${cp.label} bạn nhập "${userVal || 'trống'}", đáp án đúng là "${cp.answer}"`,
        );
      }
    });
    b3Earned = roundPoints(b3Earned);
    b3Feedback =
      b3Wrong.length === 0
        ? `Chính xác hoàn toàn: ${b3Correct.join('; ')}.`
        : b3Correct.length > 0
          ? `Đúng ${b3Correct.join('; ')}.`
          : 'Chưa trùng khớp với đáp án chuẩn.';
    b3Errors = b3Wrong.length > 0 ? b3Wrong.join(' | ') : undefined;
  } else {
    const userVal = (answers.bai3Work || '').trim();
    const ok = isFlexibleAnswerMatch(userVal, [exam.part4Essay.bai3.finalAnswer]);
    b3Earned = ok ? b3Max : 0;
    b3Feedback = ok
      ? `Chính xác! Đáp số "${exam.part4Essay.bai3.finalAnswer}" khớp hoàn toàn (+${formatScoreVi(b3Max)}đ).`
      : userVal
        ? `Đáp số "${userVal}" chưa đúng.`
        : 'Bạn chưa nhập đáp số cho bài này.';
    b3Errors = ok ? undefined : `Đáp án chuẩn: ${exam.part4Essay.bai3.finalAnswer}`;
  }

  items.push({
    itemId: 'bai3',
    title: 'Bài 3 (Vận dụng thực tế)',
    maxPoints: roundPoints(b3Max),
    earnedPoints: roundPoints(b3Earned),
    isCorrect: b3Earned >= b3Max - 0.001,
    feedback: b3Feedback,
    errorsFound: b3Errors,
  });

  const essayEarnedPoints = roundPoints(items.reduce((sum, it) => sum + it.earnedPoints, 0));
  const essayMaxPoints = roundPoints(items.reduce((sum, it) => sum + it.maxPoints, 0));
  const correctCount = items.filter((it) => it.isCorrect).length;

  return {
    essayEarnedPoints,
    essayMaxPoints,
    overallComment: `Hệ thống đã đối chiếu đáp án chuẩn: đạt ${formatScoreVi(essayEarnedPoints)}/${formatScoreVi(essayMaxPoints)} điểm phần Tự luận (${correctCount}/${items.length} bài đúng trọn vẹn). Xem tab Đáp án & Hướng dẫn chấm để đối chiếu lời giải chi tiết.`,
    items,
  };
}
