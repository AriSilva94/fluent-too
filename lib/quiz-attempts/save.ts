import type { Quiz, QuizResult } from "@/lib/quizzes/types";
import type { QuizAttemptPayload } from "./types";

type Fetcher = typeof fetch;

export type QuizAttemptSaveState = "idle" | "saved" | "anonymous" | "failed";

type BuildPayloadOptions = {
  quiz: Quiz;
  result: QuizResult;
  answers: unknown;
  attemptKey: string;
};

type SaveOptions = BuildPayloadOptions & {
  fetcher?: Fetcher;
};

export function buildQuizAttemptPayload({ quiz, result, answers, attemptKey }: BuildPayloadOptions): QuizAttemptPayload {
  return {
    attemptKey,
    quizSlug: quiz.id,
    quizTitle: quiz.title,
    targetLanguage: quiz.targetLanguage,
    level: quiz.level,
    quizType: quiz.type,
    score: result.score,
    correctCount: result.correctCount,
    incorrectCount: result.incorrectCount,
    totalCount: result.totalCount,
    answers,
    details: result.details ?? {},
  };
}

export async function saveQuizAttemptResult({ fetcher = fetch, ...options }: SaveOptions): Promise<QuizAttemptSaveState> {
  const response = await fetcher("/api/quiz-attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildQuizAttemptPayload(options)),
  }).catch(() => null);

  if (!response) return "failed";
  if (response.status === 401) return "anonymous";
  return response.ok ? "saved" : "failed";
}

export function createQuizAttemptKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
