import { describe, expect, it } from "vitest";
import {
  STUDY_LANGUAGE,
  STUDY_LANGUAGES,
  parseStudyLanguage,
  toTargetLanguage,
} from "./study-language";

describe("parseStudyLanguage", () => {
  it("aceita os idiomas suportados", () => {
    expect(parseStudyLanguage("en")).toBe(STUDY_LANGUAGE.en);
    expect(parseStudyLanguage("pt")).toBe(STUDY_LANGUAGE.pt);
    expect(parseStudyLanguage("fr")).toBe(STUDY_LANGUAGE.fr);
  });

  it("cai em todos quando não há escolha ou o valor é inválido", () => {
    expect(parseStudyLanguage(undefined)).toBe(STUDY_LANGUAGE.all);
    expect(parseStudyLanguage("")).toBe(STUDY_LANGUAGE.all);
    expect(parseStudyLanguage("klingon")).toBe(STUDY_LANGUAGE.all);
    expect(parseStudyLanguage(42)).toBe(STUDY_LANGUAGE.all);
  });
});

describe("toTargetLanguage", () => {
  it("converte a escolha em filtro da API", () => {
    expect(toTargetLanguage(STUDY_LANGUAGE.en)).toBe("en");
  });

  it("não filtra quando a escolha é todos", () => {
    expect(toTargetLanguage(STUDY_LANGUAGE.all)).toBeUndefined();
  });
});

describe("STUDY_LANGUAGES", () => {
  it("lista todos na frente dos idiomas", () => {
    expect(STUDY_LANGUAGES).toEqual([STUDY_LANGUAGE.all, STUDY_LANGUAGE.pt, STUDY_LANGUAGE.en, STUDY_LANGUAGE.fr]);
  });
});
