import { describe, expect, it } from "vitest";
import { isLanguageAllowed, slugify, validateQuizInput } from "./manage";

const valid = {
  title: "Saudações básicas",
  targetLanguage: "pt",
  level: "A1",
  type: "multiple-choice",
  questions: [{ id: "q1", question: "Bom dia?", options: ["a", "b"], correctAnswer: "a" }],
};

describe("slugify", () => {
  it("remove acentos e normaliza separadores", () => {
    expect(slugify("Saudações básicas – parte 1")).toBe("saudacoes-basicas-parte-1");
  });

  it("não deixa hífen sobrando nas pontas", () => {
    expect(slugify("  ...Olá!  ")).toBe("ola");
  });

  it("devolve string vazia quando não sobra nada aproveitável", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("validateQuizInput", () => {
  it("aceita payload completo e gera o slug a partir do título", () => {
    const result = validateQuizInput(valid);

    expect(result).toEqual({
      ok: true,
      data: {
        title: "Saudações básicas",
        slug: "saudacoes-basicas",
        targetLanguage: "pt",
        level: "A1",
        type: "multiple-choice",
        questions: valid.questions,
        isPublic: true,
      },
    });
  });

  it("respeita o slug informado, normalizado", () => {
    const result = validateQuizInput({ ...valid, slug: "Meu Slug Custom" });

    expect(result.ok && result.data.slug).toBe("meu-slug-custom");
  });

  it("exige título", () => {
    expect(validateQuizInput({ ...valid, title: "   " })).toEqual({ ok: false, error: "TITLE_REQUIRED" });
  });

  it("recusa título acima do limite", () => {
    expect(validateQuizInput({ ...valid, title: "x".repeat(121) })).toEqual({ ok: false, error: "TITLE_TOO_LONG" });
  });

  it("recusa título que não gera slug aproveitável", () => {
    expect(validateQuizInput({ ...valid, title: "!!!" })).toEqual({ ok: false, error: "INVALID_SLUG" });
  });

  it("recusa idioma, nível e tipo fora do enum", () => {
    expect(validateQuizInput({ ...valid, targetLanguage: "de" })).toEqual({ ok: false, error: "INVALID_LANGUAGE" });
    expect(validateQuizInput({ ...valid, level: "Z9" })).toEqual({ ok: false, error: "INVALID_LEVEL" });
    expect(validateQuizInput({ ...valid, type: "cloze" })).toEqual({ ok: false, error: "INVALID_QUIZ_TYPE" });
  });

  it("exige pelo menos uma questão", () => {
    expect(validateQuizInput({ ...valid, questions: [] })).toEqual({ ok: false, error: "QUESTIONS_REQUIRED" });
  });

  it("recusa quiz acima do limite de questões", () => {
    const questions = Array.from({ length: 51 }, (_, index) => ({ id: `q${index}` }));

    expect(validateQuizInput({ ...valid, questions })).toEqual({ ok: false, error: "TOO_MANY_QUESTIONS" });
  });

  it("mantém descrição e duração quando válidas", () => {
    const result = validateQuizInput({ ...valid, description: "  Uma introdução  ", estimatedMinutes: "10" });

    expect(result.ok && result.data.description).toBe("Uma introdução");
    expect(result.ok && result.data.estimatedMinutes).toBe(10);
  });

  it("descarta duração inválida em vez de recusar o quiz", () => {
    const result = validateQuizInput({ ...valid, estimatedMinutes: -3 });

    expect(result.ok && "estimatedMinutes" in result.data).toBe(false);
  });

  it("ignora owner enviado pelo cliente", () => {
    const result = validateQuizInput({ ...valid, owner: 99 });

    expect(result.ok && "owner" in result.data).toBe(false);
  });

  it("trata isPublic como verdadeiro por padrão e respeita false explícito", () => {
    const openQuiz = validateQuizInput(valid);
    expect(openQuiz.ok && openQuiz.data.isPublic).toBe(true);
    const restricted = validateQuizInput({ ...valid, isPublic: false });
    expect(restricted.ok && restricted.data.isPublic).toBe(false);
  });
});

describe("isLanguageAllowed", () => {
  it("libera admin em qualquer idioma", () => {
    expect(isLanguageAllowed([], "fr", true)).toBe(true);
  });

  it("libera professor apenas no idioma aprovado", () => {
    expect(isLanguageAllowed(["en"], "en", false)).toBe(true);
    expect(isLanguageAllowed(["en"], "pt", false)).toBe(false);
  });

  it("barra quando a lista está ausente ou inválida", () => {
    expect(isLanguageAllowed(undefined, "en", false)).toBe(false);
    expect(isLanguageAllowed("en", "en", false)).toBe(false);
  });
});
