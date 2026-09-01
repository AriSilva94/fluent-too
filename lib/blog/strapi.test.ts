import { describe, expect, it, vi } from "vitest";
import { createStrapiBlogClient, getBlogPosts, getBlogPostBySlug } from "./strapi";

describe("createStrapiBlogClient", () => {
  it("aceita post sem `content` (listagem enxuta) e ainda mapeia os outros campos", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      data: [
        {
          slug: "a1-en-basics",
          title: "Basics",
          category: "grammar",
          excerpt: "Excerpt",
          date: "2026-01-01",
          author: "Team",
          readingTime: 3,
          targetLanguage: "en",
        },
      ],
    })));
    const client = createStrapiBlogClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.getBlogPosts({ targetLanguage: "en" })).resolves.toEqual([
      {
        slug: "a1-en-basics",
        title: "Basics",
        category: "grammar",
        excerpt: "Excerpt",
        date: "2026-01-01",
        author: "Team",
        readingTime: 3,
        targetLanguage: "en",
      },
    ]);
  });
});

describe("getBlogPosts (listagem)", () => {
  it("pede so os campos da listagem, sem `content`", async () => {
    const originalFetch = global.fetch;
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [] })));
    global.fetch = fetcher as unknown as typeof fetch;

    try {
      await getBlogPosts("en");
      const url = decodeURIComponent(String(fetcher.mock.calls.at(0)?.at(0)));
      expect(url).toContain("fields[0]=title");
      expect(url).not.toContain("content");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe("getBlogPostBySlug (detalhe)", () => {
  it("nao restringe fields, pra trazer o content inteiro", async () => {
    const originalFetch = global.fetch;
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [] })));
    global.fetch = fetcher as unknown as typeof fetch;

    try {
      await getBlogPostBySlug("a1-en-basics");
      const url = decodeURIComponent(String(fetcher.mock.calls.at(0)?.at(0)));
      expect(url).not.toContain("fields[0]");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
