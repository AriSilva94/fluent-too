export type QuizLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type QuizType = 'multiple-choice' | 'flashcard' | 'fill-gap';

export interface BaseQuestion {
  id: string;
  question: string; // The prompt or question text
  explanation?: string; // Optional explanation for the answer
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  options: string[];
  correctAnswer: string; // The exact string matching one of the options
}

export interface FillGapQuestion extends BaseQuestion {
  parts: string[]; // e.g. ["The cat is ", " the table."]
  correctAnswers: string[]; // e.g. ["on"] - corresponds to the gaps between parts
}

export interface FlashcardQuestion extends BaseQuestion {
  front: string;
  back: string;
}

export interface QuizBase {
  id: string;
  title: string; // Translatable key or raw text? Let's use raw text for content for now as per instructions.
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
  score: number; // 0 to 100
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  details?: Record<string, boolean>; // questionId -> isCorrect
}
