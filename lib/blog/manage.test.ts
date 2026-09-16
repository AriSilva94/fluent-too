import { describe, expect, it } from "vitest";
import { isIsoDate, validateBlogPostInput } from "./manage";

const valid = {
  title: "Como estudar idiomas",
  category: "Dicas",
  excerpt: "Um resumo curto.",
  content: "O conteúdo completo do artigo.",
  date: "2026-08-31",
  author: "Ariovaldo",
  targetLanguage: "pt",
};

describe("isIsoDate", () => {
  it("aceita o formato do input type=date", () => {
    expect(isIsoDate("2026-08-31")).toBe(true);
  });

  it("recusa formatos diferentes e datas inexistentes", () => {
    expect(isIsoDate("31/08/2026")).toBe(false);
    expect(isIsoDate("2026-8-31")).toBe(false);
    expect(isIsoDate("2026-02-31")).toBe(false);
    expect(isIsoDate("")).toBe(false);
  });
});

describe("validateBlogPostInput", () => {
  it("aceita o artigo completo e gera o slug a partir do título", () => {
    const result = validateBlogPostInput(valid);

    expect(result).toEqual({ ok: true, data: { ...valid, slug: "como-estudar-idiomas" } });
  });

  it("respeita o slug informado, normalizado", () => {
    const result = validateBlogPostInput({ ...valid, slug: "Meu Slug" });

    expect(result.ok && result.data.slug).toBe("meu-slug");
  });

  it("exige cada campo obrigatório, apontando qual falta", () => {
    expect(validateBlogPostInput({ ...valid, title: " " })).toEqual({ ok: false, error: "TITLE_REQUIRED" });
    expect(validateBlogPostInput({ ...valid, category: "" })).toEqual({ ok: false, error: "CATEGORY_REQUIRED" });
    expect(validateBlogPostInput({ ...valid, excerpt: "" })).toEqual({ ok: false, error: "EXCERPT_REQUIRED" });
    expect(validateBlogPostInput({ ...valid, content: "" })).toEqual({ ok: false, error: "CONTENT_REQUIRED" });
    expect(validateBlogPostInput({ ...valid, author: "" })).toEqual({ ok: false, error: "AUTHOR_REQUIRED" });
  });

  it("recusa data e idioma inválidos", () => {
    expect(validateBlogPostInput({ ...valid, date: "ontem" })).toEqual({ ok: false, error: "INVALID_DATE" });
    expect(validateBlogPostInput({ ...valid, targetLanguage: "de" })).toEqual({ ok: false, error: "INVALID_LANGUAGE" });
  });

  it("recusa título que não gera slug aproveitável", () => {
    expect(validateBlogPostInput({ ...valid, title: "###" })).toEqual({ ok: false, error: "INVALID_SLUG" });
  });

  it("mantém o tempo de leitura quando positivo e descarta o resto", () => {
    expect(validateBlogPostInput({ ...valid, readingTime: 7 }).ok && validateBlogPostInput({ ...valid, readingTime: 7 })).toMatchObject({
      data: { readingTime: 7 },
    });

    const invalid = validateBlogPostInput({ ...valid, readingTime: 0 });
    expect(invalid.ok && "readingTime" in invalid.data).toBe(false);
  });

  it("ignora owner enviado pelo cliente", () => {
    const result = validateBlogPostInput({ ...valid, owner: 3 });

    expect(result.ok && "owner" in result.data).toBe(false);
  });
});
