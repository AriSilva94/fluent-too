import { describe, expect, it } from "vitest";
import { countPublicationState, fillSummary } from "./overview";

describe("resumo do painel administrativo", () => {
  it("separa publicados de rascunhos", () => {
    const count = countPublicationState([
      { publishedAt: "2026-01-01T00:00:00.000Z" },
      { publishedAt: null },
      { publishedAt: undefined },
    ]);

    expect(count).toEqual({ total: 3, drafts: 2 });
  });

  it("conta lista vazia sem quebrar", () => {
    expect(countPublicationState([])).toEqual({ total: 0, drafts: 0 });
  });

  it("devolve nulo quando a carga falhou", () => {
    expect(countPublicationState(null)).toBeNull();
    expect(fillSummary("{total} · {drafts}", null)).toBeNull();
  });

  it("preenche o texto do resumo", () => {
    expect(fillSummary("{total} quizzes · {drafts} em rascunho", { total: 18, drafts: 4 })).toBe(
      "18 quizzes · 4 em rascunho"
    );
  });
});
