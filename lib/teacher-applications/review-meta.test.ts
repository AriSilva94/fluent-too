import { describe, expect, it } from "vitest";
import { buildDecisionLine, formatReviewDate, reviewerName } from "./review-meta";

describe("dados da decisão da candidatura", () => {
  it("prefere o nome de usuário e cai para o e-mail", () => {
    expect(reviewerName({ username: "ana", email: "ana@fluent.local" })).toBe("ana");
    expect(reviewerName({ username: "  ", email: "ana@fluent.local" })).toBe("ana@fluent.local");
    expect(reviewerName(null)).toBeNull();
  });

  it("formata a data no idioma da interface", () => {
    expect(formatReviewDate("2026-02-20T14:30:00.000Z", "pt-br")).toContain("2026");
    expect(formatReviewDate("2026-02-20T14:30:00.000Z", "en-us")).toContain("2026");
  });

  it("recusa data ausente ou inválida", () => {
    expect(formatReviewDate(null, "pt-br")).toBeNull();
    expect(formatReviewDate("sem data", "pt-br")).toBeNull();
  });

  it("monta a linha com revisor e data", () => {
    const linha = buildDecisionLine({
      reviewer: { username: "ana" },
      reviewedAt: "2026-02-20T14:30:00.000Z",
      locale: "pt-br",
      byTemplate: "por {reviewer}",
      unknownReviewer: "um administrador",
    });

    expect(linha.startsWith("por ana · ")).toBe(true);
  });

  it("usa o revisor genérico e omite a data quando faltam", () => {
    const linha = buildDecisionLine({
      reviewer: null,
      reviewedAt: null,
      locale: "pt-br",
      byTemplate: "por {reviewer}",
      unknownReviewer: "um administrador",
    });

    expect(linha).toBe("por um administrador");
  });
});
