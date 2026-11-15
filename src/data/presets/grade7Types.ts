import type { Grade7Exam } from '../../types/exam.ts';
import { buildMcqOptions } from './mcqHelper.ts';

export interface G7McqSpec {
  domain: 'algebra' | 'geometry' | 'statistics';
  question: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  svg?: string;
}

export interface G7TrueFalseSpec {
  id: 13 | 14;
  stem: string;
  svg?: string;
  statements: Array<{
    label: 'a' | 'b' | 'c' | 'd';
    text: string;
    isTrue: boolean;
    explanation: string;
  }>;
}

export interface G7ShortSpec {
  question: string;
  svg?: string;
  displayAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
}

export interface G7WeekSpec {
  week: number;
  title: string;
  subtitle: string;
  timeMinutes?: number;
  mcqs: G7McqSpec[];
  tf13: G7TrueFalseSpec;
  tf14: G7TrueFalseSpec;
  shortAnswers: G7ShortSpec[];
  bai1Stem: string;
  bai1Parts: Array<{
    label: 'a' | 'b';
    prompt: string;
    result: string;
    solutionSteps: string[];
  }>;
  bai2Stem: string;
  bai2Svg: string;
  bai2Parts: Array<{
    label: 'a' | 'b';
    prompt: string;
    solutionSteps: string[];
    finalConclusion: string;
  }>;
  bai3Stem: string;
  bai3Svg?: string;
  bai3Steps: string[];
  bai3Conclusions: Array<{ label: string; answer: string }>;
  bai3FinalAnswer: string;
  bai3Rubric: string[];
}

export function buildGrade7Exam(spec: G7WeekSpec): Grade7Exam {
  return {
    grade: 7,
    week: spec.week,
    level: 'standard',
    title: spec.title,
    subtitle: spec.subtitle,
    timeMinutes: spec.timeMinutes ?? 45,
    variantLabel: `Đề chuẩn Tuần ${spec.week} (Tạo sẵn)`,
    part1MultipleChoice: spec.mcqs.map((m, idx) => {
      const built = buildMcqOptions(m.correct, m.distractors, spec.week * 13 + idx * 5);
      return {
        id: idx + 1,
        points: 0.25,
        domain: m.domain,
        question: m.question,
        svg: m.svg || '',
        options: built.options,
        correctOption: built.correctOption,
        explanation: m.explanation,
      };
    }),
    part2TrueFalse: [
      {
        id: 13,
        points: 1,
        stem: spec.tf13.stem,
        svg: spec.tf13.svg || '',
        statements: spec.tf13.statements.map((s) => ({ ...s, points: 0.25 })),
      },
      {
        id: 14,
        points: 1,
        stem: spec.tf14.stem,
        svg: spec.tf14.svg || '',
        statements: spec.tf14.statements.map((s) => ({ ...s, points: 0.25 })),
      },
    ],
    part3ShortAnswer: spec.shortAnswers.map((sa, idx) => ({
      id: 15 + idx,
      points: 0.5,
      question: sa.question,
      svg: sa.svg || '',
      displayAnswer: sa.displayAnswer,
      acceptedAnswers: sa.acceptedAnswers,
      explanation: sa.explanation,
    })),
    part4Essay: {
      bai1: {
        points: 1,
        stem: spec.bai1Stem,
        parts: spec.bai1Parts.map((p) => ({ ...p, points: 0.5 })),
      },
      bai2: {
        points: 1,
        stem: spec.bai2Stem,
        svg: spec.bai2Svg,
        parts: spec.bai2Parts.map((p) => ({ ...p, points: 0.5 })),
      },
      bai3: {
        points: 1,
        stem: spec.bai3Stem,
        svg: spec.bai3Svg || '',
        solutionSteps: spec.bai3Steps,
        conclusionPrompts: spec.bai3Conclusions,
        finalAnswer: spec.bai3FinalAnswer,
        rubric: spec.bai3Rubric,
      },
    },
  };
}
