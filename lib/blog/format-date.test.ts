import { describe, expect, it } from "vitest";
import { formatBlogDate, parseIsoDate } from "./format-date";

describe("formatação da data do blog", () => {
  it("formata a mesma data no idioma da interface", () => {
    expect(formatBlogDate("2026-02-20", "pt-br")).toBe("20 de fevereiro de 2026");
    expect(formatBlogDate("2026-02-20", "en-us")).toBe("February 20, 2026");
    expect(formatBlogDate("2026-02-20", "fr-fr")).toBe("20 février 2026");
  });

  it("não desloca o dia por fuso horário", () => {
    expect(formatBlogDate("2026-03-01", "pt-br")).toBe("1 de março de 2026");
    expect(formatBlogDate("2025-12-18", "en-us")).toBe("December 18, 2025");
  });

  it("aceita data com hora", () => {
    expect(formatBlogDate("2026-02-20T00:00:00.000Z", "pt-br")).toBe("20 de fevereiro de 2026");
  });

  it("devolve o valor original quando não é uma data ISO", () => {
    expect(formatBlogDate("20 de Fevereiro, 2026", "pt-br")).toBe("20 de Fevereiro, 2026");
    expect(parseIsoDate("sem data")).toBeNull();
  });
});
