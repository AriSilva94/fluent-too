import { describe, expect, it, vi } from "vitest";
import { createStrapiQuizClient, getQuizzesGroupedByLevels } from "./strapi";

describe("createStrapiQuizClient", () => {
  it("busca quizzes publicados por idioma e nivel no Strapi", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      data: [
        {
          id: 12,
          documentId: "doc-1",
          title: "Basic Greetings",
          slug: "a1-en-basics-mc",
          description: "Practice greetings",
          level: "A1",
          type: "multiple-choice",
          targetLanguage: "en",
          questions: [
            {
              id: "q1",
              question: "Choose",
              options: ["Hello", "Bye"],
              correctAnswer: "Hello",
            },
          ],
        },
      ],
    })));
    const client = createStrapiQuizClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.getQuizzes({ targetLanguage: "en", level: "A1" })).resolves.toEqual([
      {
        id: "a1-en-basics-mc",
        title: "Basic Greetings",
        description: "Practice greetings",
        level: "A1",
        type: "multiple-choice",
        targetLanguage: "en",
        questions: [
          {
            id: "q1",
            question: "Choose",
            options: ["Hello", "Bye"],
            correctAnswer: "Hello",
          },
        ],
      },
    ]);

    const url = String(fetcher.mock.calls.at(0)?.at(0));
    expect(url).toContain("https://api.internal/api/quizzes?");
    expect(decodeURIComponent(url)).toContain("filters[targetLanguage][$eq]=en");
    expect(decodeURIComponent(url)).toContain("filters[level][$eq]=A1");
    expect(decodeURIComponent(url)).toContain("status=published");
  });

  it("busca quiz por slug", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      data: [
        {
          id: 14,
          attributes: {
            title: "Colors",
            slug: "a1-en-colors-gap",
            description: "Practice colors",
            level: "A1",
            type: "fill-gap",
            targetLanguage: "en",
            questions: [
              {
                id: "g1",
                question: "The sky is",
                parts: ["The sky is ", "."],
                correctAnswers: ["blue"],
              },
            ],
          },
        },
      ],
    })));
    const client = createStrapiQuizClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.getQuizBySlug("a1-en-colors-gap", "en")).resolves.toMatchObject({
      id: "a1-en-colors-gap",
      title: "Colors",
      type: "fill-gap",
      targetLanguage: "en",
    });

    expect(decodeURIComponent(String(fetcher.mock.calls.at(0)?.at(0)))).toContain("filters[slug][$eq]=a1-en-colors-gap");
  });

  it("retorna colecao vazia quando o Strapi falha", async () => {
    const fetcher = vi.fn(async () => new Response("offline", { status: 503 }));
    const client = createStrapiQuizClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.getQuizzes({ targetLanguage: "pt" })).resolves.toEqual([]);
    await expect(client.getQuizBySlug("a1-pt-basics-mc", "pt")).resolves.toBeNull();
  });

  it("filtra por multiplos niveis com $in numa unica chamada", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [] })));
    const client = createStrapiQuizClient({ baseUrl: "https://api.internal", fetcher });

    await client.getQuizzes({ targetLanguage: "en", levels: ["C1", "C2"] });

    const url = decodeURIComponent(String(fetcher.mock.calls.at(0)?.at(0)));
    expect(url).toContain("filters[level][$in][0]=C1");
    expect(url).toContain("filters[level][$in][1]=C2");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("getQuizzes (listagem)", () => {
  it("pede so os campos da listagem, sem `questions`", async () => {
    const originalFetch = global.fetch;
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [] })));
    global.fetch = fetcher as unknown as typeof fetch;

    try {
      const { getQuizzes } = await import("./strapi");
      await getQuizzes("en");
      const url = decodeURIComponent(String(fetcher.mock.calls.at(0)?.at(0)));
      expect(url).toContain("fields[0]=title");
      expect(url).not.toContain("questions");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("getQuizById (detalhe)", () => {
  it("nao restringe fields, pra trazer as perguntas", async () => {
    const originalFetch = global.fetch;
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [] })));
    global.fetch = fetcher as unknown as typeof fetch;

    try {
      const { getQuizById } = await import("./strapi");
      await getQuizById("a1-en-basics-mc");
      const url = decodeURIComponent(String(fetcher.mock.calls.at(0)?.at(0)));
      expect(url).not.toContain("fields[0]");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("getQuizzesGroupedByLevels", () => {
  it("faz uma unica requisicao para todos os grupos e agrupa o resultado por nivel", async () => {
    const quizzesByLevel: Record<string, { level: string; slug: string }> = {
      A1: { level: "A1", slug: "a1-quiz" },
      C1: { level: "C1", slug: "c1-quiz" },
      C2: { level: "C2", slug: "c2-quiz" },
    };
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: Object.values(quizzesByLevel).map((quiz) => ({
            slug: quiz.slug,
            title: "Quiz",
            description: "Desc",
            level: quiz.level,
            type: "multiple-choice",
            targetLanguage: "en",
            questions: [{ id: "q1", question: "?", options: ["a"], correctAnswer: "a" }],
          })),
        })
      )
    );

    const originalFetch = global.fetch;
    global.fetch = fetcher as unknown as typeof fetch;
    try {
      const result = await getQuizzesGroupedByLevels([["A1"], ["C1", "C2"]], "en");
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(result[0].map((q) => q.id)).toEqual(["a1-quiz"]);
      expect(result[1].map((q) => q.id).sort()).toEqual(["c1-quiz", "c2-quiz"]);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
