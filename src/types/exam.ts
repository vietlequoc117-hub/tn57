import type { ExamDifficulty, GradeLevel } from '../data/curriculum.ts';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface Grade5MultipleChoiceQuestion {
  id: number;
  points: number;
  question: string;
  svg?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: OptionKey;
  explanation: string;
}

export interface Grade5Question1Item {
  label: 'a' | 'b' | 'c' | 'd';
  prompt: string;
  answer: string;
  acceptedAnswers: string[];
  unit?: string;
  points: number;
}

export interface Grade5CalculationItem {
  id: string;
  expression: string;
  operation: 'add' | 'sub' | 'mul' | 'div';
  result: string;
  stepsNote: string;
  points: number;
}

export interface Grade5ConvenientCalcItem {
  id: string;
  expression: string;
  result: string;
  solutionSteps: string[];
  points: number;
}

export interface Grade5Question3Item {
  label: 'a' | 'b';
  prompt: string;
  answer: string;
  solutionSteps: string[];
  points: number;
}

export interface Grade5Exam {
  grade: 5;
  week: number;
  level: ExamDifficulty;
  title: string;
  subtitle: string;
  timeMinutes: number;
  variantLabel: string;
  multipleChoice: Grade5MultipleChoiceQuestion[];
  essay: {
    q1: {
      points: number;
      prompt: string;
      svg?: string;
      items: Grade5Question1Item[];
    };
    q2: {
      points: number;
      partA: {
        prompt: string;
        items: Grade5CalculationItem[];
      };
      partB: {
        prompt: string;
        items: Grade5ConvenientCalcItem[];
      };
    };
    q3: {
      points: number;
      prompt: string;
      svg?: string;
      tableData?: {
        headers: string[];
        rows: string[][];
      };
      items: Grade5Question3Item[];
    };
    q4: {
      points: number;
      prompt: string;
      svg?: string;
      solutionSteps: string[];
      finalAnswer: string;
      rubric: string[];
    };
    q5: {
      points: number;
      prompt: string;
      svg?: string;
      solutionSteps: string[];
      finalAnswer: string;
      rubric: string[];
    };
  };
}

export interface Grade7MultipleChoiceQuestion {
  id: number;
  points: number;
  domain: 'algebra' | 'geometry' | 'statistics';
  question: string;
  svg?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: OptionKey;
  explanation: string;
}

export interface Grade7TrueFalseStatement {
  label: 'a' | 'b' | 'c' | 'd';
  text: string;
  isTrue: boolean;
  explanation: string;
  points: number;
}

export interface Grade7TrueFalseQuestion {
  id: 13 | 14;
  points: number;
  stem: string;
  svg?: string;
  statements: Grade7TrueFalseStatement[];
}

export interface Grade7ShortAnswerQuestion {
  id: number;
  points: number;
  question: string;
  svg?: string;
  displayAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
}

export interface Grade7EssayPart {
  label: 'a' | 'b';
  prompt: string;
  result: string;
  solutionSteps: string[];
  points: number;
}

export interface Grade7Exam {
  grade: 7;
  week: number;
  level: ExamDifficulty;
  title: string;
  subtitle: string;
  timeMinutes: number;
  variantLabel: string;
  part1MultipleChoice: Grade7MultipleChoiceQuestion[];
  part2TrueFalse: Grade7TrueFalseQuestion[];
  part3ShortAnswer: Grade7ShortAnswerQuestion[];
  part4Essay: {
    bai1: {
      points: number;
      stem: string;
      parts: Grade7EssayPart[];
    };
    bai2: {
      points: number;
      stem: string;
      svg: string;
      parts: Array<{
        label: 'a' | 'b';
        prompt: string;
        solutionSteps: string[];
        finalConclusion: string;
        points: number;
      }>;
    };
    bai3: {
      points: number;
      stem: string;
      svg?: string;
      solutionSteps: string[];
      conclusionPrompts: Array<{
        label: string;
        answer: string;
      }>;
      finalAnswer: string;
      rubric: string[];
    };
  };
}

export type ExamData = Grade5Exam | Grade7Exam;

export interface SavedExamRecord {
  id: string;
  grade: GradeLevel;
  week: number;
  level: ExamDifficulty;
  createdAt: string;
  exam: ExamData;
}

export interface Grade5StudentAnswers {
  mc: Record<number, OptionKey | undefined>;
  q1: Record<'a' | 'b' | 'c' | 'd', string>;
  q2aWork: Record<string, string>;
  q2aResult: Record<string, string>;
  q2bWork: Record<string, string>;
  q2bResult: Record<string, string>;
  q3: Record<'a' | 'b', string>;
  q4Work: string;
  q4Answer: string;
  q5Work: string;
  q5Answer: string;
}

export interface Grade7StudentAnswers {
  mc: Record<number, OptionKey | undefined>;
  tf: Record<number, Record<'a' | 'b' | 'c' | 'd', boolean | undefined>>;
  short: Record<number, string>;
  bai1Work: Record<'a' | 'b', string>;
  bai1Result: Record<'a' | 'b', string>;
  bai2Work: Record<'a' | 'b', string>;
  bai3Work: string;
  bai3Conclusions: Record<number, string>;
}

export interface EssayItemFeedback {
  itemId: string;
  title: string;
  maxPoints: number;
  earnedPoints: number;
  isCorrect: boolean;
  feedback: string;
  errorsFound?: string;
  suggestion?: string;
}

export interface EssayGradingResponse {
  essayEarnedPoints: number;
  essayMaxPoints: number;
  overallComment: string;
  items: EssayItemFeedback[];
}

export interface GradingResult {
  objectiveEarnedPoints: number;
  objectiveMaxPoints: number;
  essayEarnedPoints: number;
  essayMaxPoints: number;
  totalScore: number;
  objectiveDetails: Record<string, { isCorrect: boolean; earned: number; max: number; userAnswer: string; correctAnswer: string }>;
  essayResult: EssayGradingResponse;
  gradedAt: string;
}

export interface ScoreHistoryEntry {
  id: string;
  examId: string;
  grade: GradeLevel;
  week: number;
  level: ExamDifficulty;
  title: string;
  studentName?: string;
  studentClass?: string;
  totalScore: number;
  objectiveScore: number;
  essayScore: number;
  durationSeconds: number;
  submittedAt: string;
}
