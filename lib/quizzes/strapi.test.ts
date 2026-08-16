import { describe, expect, it, vi } from "vitest";
import { createStrapiQuizClient } from "./strapi";

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
});
