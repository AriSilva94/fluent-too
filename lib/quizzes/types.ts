export const QUIZ_LEVEL = { a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2' } as const;

export type QuizLevel = (typeof QUIZ_LEVEL)[keyof typeof QUIZ_LEVEL];

export const QUIZ_TYPE = {
  multipleChoice: 'multiple-choice',
  flashcard: 'flashcard',
  fillGap: 'fill-gap',
} as const;

export type QuizType = (typeof QUIZ_TYPE)[keyof typeof QUIZ_TYPE];

export const TARGET_LANGUAGE = { pt: 'pt', en: 'en', fr: 'fr' } as const;

export type TargetLanguage = (typeof TARGET_LANGUAGE)[keyof typeof TARGET_LANGUAGE];

export interface BaseQuestion {
  id: string;
  question: string;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  options: string[];
  correctAnswer: string;
}

export interface FillGapQuestion extends BaseQuestion {
  parts: string[];
  correctAnswers: string[];
}

export interface FlashcardQuestion extends BaseQuestion {
  front: string;
  back: string;
}

export interface QuizBase {
  id: string;
  title: string;
  description: string;
  level: QuizLevel;
  type: QuizType;
  image?: string;
  targetLanguage: TargetLanguage;
}

export interface MultipleChoiceQuiz extends QuizBase {
  type: typeof QUIZ_TYPE.multipleChoice;
  questions: MultipleChoiceQuestion[];
}

export interface FlashcardQuiz extends QuizBase {
  type: typeof QUIZ_TYPE.flashcard;
  questions: FlashcardQuestion[];
}

export interface FillGapQuiz extends QuizBase {
  type: typeof QUIZ_TYPE.fillGap;
  questions: FillGapQuestion[];
}

export type Quiz = MultipleChoiceQuiz | FlashcardQuiz | FillGapQuiz;

export interface QuizResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  details?: Record<string, boolean>;
}
