export type QuizLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type QuizType = 'multiple-choice' | 'flashcard' | 'fill-gap';

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
  targetLanguage: 'pt' | 'en' | 'fr';
}

export interface MultipleChoiceQuiz extends QuizBase {
  type: 'multiple-choice';
  questions: MultipleChoiceQuestion[];
}

export interface FlashcardQuiz extends QuizBase {
  type: 'flashcard';
  questions: FlashcardQuestion[];
}

export interface FillGapQuiz extends QuizBase {
  type: 'fill-gap';
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
