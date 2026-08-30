import { describe, expect, it, vi } from "vitest";
import { buildQuizAttemptPayload, saveQuizAttemptResult } from "./save";
import type { Quiz, QuizResult } from "@/lib/quizzes/types";

const quiz: Quiz = {
  id: "a1-en-days-mc",
  title: "Days",
  description: "Days quiz",
  level: "A1",
  type: "multiple-choice",
  targetLanguage: "en",
  questions: [
    {
      id: "q1",
      question: "Monday",
      options: ["Monday", "Tuesday"],
      correctAnswer: "Monday",
    },
  ],
};

const result: QuizResult = {
  score: 100,
  correctCount: 1,
  incorrectCount: 0,
  totalCount: 1,
  details: { q1: true },
};

describe("quiz attempt save", () => {
  it("monta payload com chave de tentativa recebida pelo handler", () => {
    expect(buildQuizAttemptPayload({ quiz, result, answers: { q1: "Monday" }, attemptKey: "attempt-1" })).toEqual({
      attemptKey: "attempt-1",
      quizSlug: "a1-en-days-mc",
      quizTitle: "Days",
      targetLanguage: "en",
      level: "A1",
      quizType: "multiple-choice",
      score: 100,
      correctCount: 1,
      incorrectCount: 0,
      totalCount: 1,
      answers: { q1: "Monday" },
      details: result.details,
    });
  });

  it("salva somente quando a funcao de acao e chamada", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(
      saveQuizAttemptResult({ quiz, result, answers: { q1: "Monday" }, attemptKey: "attempt-1", fetcher })
    ).resolves.toBe("saved");

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/quiz-attempts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(buildQuizAttemptPayload({ quiz, result, answers: { q1: "Monday" }, attemptKey: "attempt-1" })),
      })
    );
  });

  it("retorna anonymous para resposta 401", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: false }), { status: 401 }));

    await expect(
      saveQuizAttemptResult({ quiz, result, answers: { q1: "Monday" }, attemptKey: "attempt-1", fetcher })
    ).resolves.toBe("anonymous");
  });

  it("retorna profileRequired para 403 PROFILE_REQUIRED, e nao um failed generico", async () => {
    const fetcher = vi.fn(
      async () => new Response(JSON.stringify({ ok: false, error: "PROFILE_REQUIRED" }), { status: 403 })
    );

    await expect(
      saveQuizAttemptResult({ quiz, result, answers: { q1: "Monday" }, attemptKey: "attempt-1", fetcher })
    ).resolves.toBe("profileRequired");
  });

  it("mantem failed para um 403 de outra causa", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: false }), { status: 403 }));

    await expect(
      saveQuizAttemptResult({ quiz, result, answers: { q1: "Monday" }, attemptKey: "attempt-1", fetcher })
    ).resolves.toBe("failed");
  });
});
