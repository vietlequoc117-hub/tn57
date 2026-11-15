import type { Grade5Exam } from '../../types/exam.ts';
import { buildMcqOptions } from './mcqHelper.ts';

export interface G5McqSpec {
  question: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  svg?: string;
}

export interface G5WeekSpec {
  week: number;
  title: string;
  subtitle: string;
  mcqs: G5McqSpec[];
  q1Prompt: string;
  q1Svg?: string;
  q1Items: Array<{
    label: 'a' | 'b' | 'c' | 'd';
    prompt: string;
    answer: string;
    acceptedAnswers: string[];
    unit?: string;
  }>;
  q2aPrompt: string;
  q2aItems: Array<{
    id: string;
    expression: string;
    operation: 'add' | 'sub' | 'mul' | 'div';
    result: string;
    stepsNote: string;
  }>;
  q2bPrompt: string;
  q2bItems: Array<{
    id: string;
    expression: string;
    result: string;
    solutionSteps: string[];
  }>;
  q3Prompt: string;
  q3Svg?: string;
  q3Table?: { headers: string[]; rows: string[][] };
  q3Items: Array<{
    label: 'a' | 'b';
    prompt: string;
    answer: string;
    solutionSteps: string[];
  }>;
  q4Prompt: string;
  q4Svg?: string;
  q4Steps: string[];
  q4Answer: string;
  q4Rubric: string[];
  q5Prompt: string;
  q5Svg?: string;
  q5Steps: string[];
  q5Answer: string;
  q5Rubric: string[];
}

export function buildGrade5Exam(spec: G5WeekSpec): Grade5Exam {
  return {
    grade: 5,
    week: spec.week,
    level: 'standard',
    title: spec.title,
    subtitle: spec.subtitle,
    timeMinutes: 40,
    variantLabel: `Đề chuẩn Tuần ${spec.week} (Tạo sẵn)`,
    multipleChoice: spec.mcqs.map((m, idx) => {
      const built = buildMcqOptions(m.correct, m.distractors, spec.week * 11 + idx * 3);
      return {
        id: idx + 1,
        points: 0.5,
        question: m.question,
        svg: m.svg || '',
        options: built.options,
        correctOption: built.correctOption,
        explanation: m.explanation,
      };
    }),
    essay: {
      q1: {
        points: 1,
        prompt: spec.q1Prompt,
        svg: spec.q1Svg || '',
        items: spec.q1Items.map((it) => ({ ...it, points: 0.25 })),
      },
      q2: {
        points: 2,
        partA: {
          prompt: spec.q2aPrompt,
          items: spec.q2aItems.map((it) => ({ ...it, points: 0.5 })),
        },
        partB: {
          prompt: spec.q2bPrompt,
          items: spec.q2bItems.map((it) => ({ ...it, points: 0.5 })),
        },
      },
      q3: {
        points: 1,
        prompt: spec.q3Prompt,
        svg: spec.q3Svg || '',
        tableData: spec.q3Table,
        items: spec.q3Items.map((it) => ({ ...it, points: 0.5 })),
      },
      q4: {
        points: 1.5,
        prompt: spec.q4Prompt,
        svg: spec.q4Svg || '',
        solutionSteps: spec.q4Steps,
        finalAnswer: spec.q4Answer,
        rubric: spec.q4Rubric,
      },
      q5: {
        points: 0.5,
        prompt: spec.q5Prompt,
        svg: spec.q5Svg || '',
        solutionSteps: spec.q5Steps,
        finalAnswer: spec.q5Answer,
        rubric: spec.q5Rubric,
      },
    },
  };
}
