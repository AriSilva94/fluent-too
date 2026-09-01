import { describe, expect, it, vi } from "vitest";
import { createQuizManageClient, mapStrapiErrorCode } from "./manage-client";
import type { QuizInput } from "./manage";

const payload: QuizInput = {
  title: "Saudações",
  slug: "saudacoes",
  targetLanguage: "pt",
  level: "A1",
  type: "multiple-choice",
  questions: [{ id: "q1" }],
  isPublic: true,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("createQuizManageClient", () => {
  it("lista apenas os quizzes do dono, incluindo rascunhos", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ data: [{ documentId: "abc" }] }));
    const client = createQuizManageClient({ baseUrl: "http://api", fetcher: fetcher as never });

    const result = await client.listOwn("token");

    expect(result).toEqual({ ok: true, data: [{ documentId: "abc" }] });
    const url = fetcher.mock.calls[0][0] as string;
    expect(url).toContain("/api/quizzes/mine");
    expect(url).not.toContain("owner");
    expect(url).toContain("status=draft");
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe("Bearer token");
  });

  it("envia a criação embrulhada em data", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ data: { documentId: "abc" } }, 201));
    const client = createQuizManageClient({ baseUrl: "http://api", fetcher: fetcher as never });

    const result = await client.create("token", payload);

    expect(result).toEqual({ ok: true, data: { documentId: "abc" } });
    const init = fetcher.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ data: payload });
  });

  it("traduz slug duplicado devolvido pelo Strapi", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(jsonResponse({ error: { message: "This attribute must be unique" } }, 400));
    const client = createQuizManageClient({ baseUrl: "http://api", fetcher: fetcher as never });

    expect(await client.create("token", payload)).toEqual({ ok: false, error: "SLUG_TAKEN", status: 400 });
  });

  it("traduz 403 do Strapi como idioma não permitido", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ error: { message: "Forbidden" } }, 403));
    const client = createQuizManageClient({ baseUrl: "http://api", fetcher: fetcher as never });

    expect(await client.update("token", "abc", payload)).toEqual({
      ok: false,
      error: "LANGUAGE_NOT_ALLOWED",
      status: 403,
    });
  });

  it("trata falha de rede sem estourar", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"));
    const client = createQuizManageClient({ baseUrl: "http://api", fetcher: fetcher as never });

    expect(await client.remove("token", "abc")).toEqual({ ok: false, error: "UNKNOWN_ERROR", status: 502 });
  });

  it("aceita 204 sem corpo na remoção", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createQuizManageClient({ baseUrl: "http://api", fetcher: fetcher as never });

    expect(await client.remove("token", "abc")).toEqual({ ok: true, data: null });
  });
});

describe("mapStrapiErrorCode", () => {
  it("reconhece conflito de slug", () => {
    expect(mapStrapiErrorCode("This attribute must be unique", 400)).toBe("SLUG_TAKEN");
    expect(mapStrapiErrorCode("slug already taken", 400)).toBe("SLUG_TAKEN");
  });

  it("mapeia status conhecidos", () => {
    expect(mapStrapiErrorCode("Forbidden", 403)).toBe("LANGUAGE_NOT_ALLOWED");
    expect(mapStrapiErrorCode("Not Found", 404)).toBe("NOT_FOUND");
  });

  it("repassa a mensagem quando não há mapeamento", () => {
    expect(mapStrapiErrorCode("QUESTIONS_REQUIRED", 400)).toBe("QUESTIONS_REQUIRED");
    expect(mapStrapiErrorCode("", 500)).toBe("UNKNOWN_ERROR");
  });
});
