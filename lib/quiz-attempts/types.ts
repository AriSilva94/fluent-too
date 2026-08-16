import type { QuizLevel, QuizType } from "@/lib/quizzes/types";

export type QuizAttemptPayload = {
  attemptKey?: string;
  quizSlug: string;
  quizTitle: string;
  targetLanguage: "pt" | "en" | "fr";
  level: QuizLevel;
  quizType: QuizType;
  score: number;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  answers?: unknown;
  details?: unknown;
};

export type QuizAttempt = QuizAttemptPayload & {
  id: number | string;
  completedAt?: string;
  createdAt?: string;
};
