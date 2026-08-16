import { describe, expect, it, vi } from "vitest";
import { createQuizAttemptsClient } from "./client";

describe("createQuizAttemptsClient", () => {
  it("envia tentativa para o Strapi com bearer token", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: { id: 1 } })));
    const client = createQuizAttemptsClient({ baseUrl: "https://api.internal", fetcher });

    await expect(
      client.create("access", {
        quizSlug: "a1-pt-basics-mc",
        quizTitle: "Saudacoes basicas",
        targetLanguage: "pt",
        level: "A1",
        quizType: "multiple-choice",
        score: 80,
        correctCount: 4,
        incorrectCount: 1,
        totalCount: 5,
        answers: { q1: "Bom dia" },
        details: { q1: true },
      })
    ).resolves.toEqual({ ok: true });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.internal/api/quiz-attempts",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer access",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("lista tentativas do usuário autenticado", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [{ id: 1, score: 90 }] })));
    const client = createQuizAttemptsClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.list("access")).resolves.toEqual({ ok: true, data: [{ id: 1, score: 90 }] });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.internal/api/quiz-attempts",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer access" }),
      })
    );
  });
});
