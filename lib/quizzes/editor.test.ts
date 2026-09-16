import { describe, expect, it } from "vitest";
import {
  countGaps,
  createEmptyQuestion,
  isQuestionDraftComplete,
  joinGapParts,
  splitGapSentence,
  syncGapAnswers,
  toQuestionDraft,
  toQuestionPayload,
} from "./editor";

const base = createEmptyQuestion("q1");

describe("lacunas", () => {
  it("quebra a frase em pedaços, uma lacuna a menos que os pedaços", () => {
    expect(splitGapSentence("Ele ___ na escola.")).toEqual(["Ele ", " na escola."]);
    expect(countGaps("Ele ___ na escola.")).toBe(1);
    expect(countGaps("It is ___ the ___.")).toBe(2);
    expect(countGaps("Sem lacuna.")).toBe(0);
  });

  it("remonta a frase a partir dos pedaços salvos", () => {
    expect(joinGapParts(["Ele ", " na escola."])).toBe("Ele ___ na escola.");
    expect(joinGapParts(undefined)).toBe("");
  });

  it("preserva as respostas já digitadas ao ajustar a quantidade de lacunas", () => {
    expect(syncGapAnswers(["on"], 2)).toEqual(["on", ""]);
    expect(syncGapAnswers(["on", "the"], 1)).toEqual(["on"]);
    expect(syncGapAnswers([], 0)).toEqual([]);
  });
});

describe("toQuestionPayload", () => {
  it("monta múltipla escolha com as opções aparadas", () => {
    expect(
      toQuestionPayload("multiple-choice", {
        ...base,
        question: " Bom dia? ",
        options: [" a ", "b"],
        correctAnswer: " a ",
      })
    ).toEqual({ id: "q1", question: "Bom dia?", options: ["a", "b"], correctAnswer: "a" });
  });

  it("converte a frase em parts no fill-gap", () => {
    expect(toQuestionPayload("fill-gap", { ...base, sentence: "Ele ___ na escola.", correctAnswers: [" estuda "] })).toEqual({
      id: "q1",
      parts: ["Ele ", " na escola."],
      correctAnswers: ["estuda"],
    });
  });

  it("monta flashcard com frente e verso", () => {
    expect(toQuestionPayload("flashcard", { ...base, front: " obrigado ", back: " thank you " })).toEqual({
      id: "q1",
      question: "obrigado",
      front: "obrigado",
      back: "thank you",
    });
  });
});

describe("toQuestionDraft", () => {
  it("recarrega múltipla escolha salva", () => {
    const draft = toQuestionDraft(
      "multiple-choice",
      { id: "q9", question: "Bom dia?", options: ["a", "b"], correctAnswer: "a" },
      "fallback"
    );

    expect(draft).toMatchObject({ id: "q9", question: "Bom dia?", options: ["a", "b"], correctAnswer: "a" });
  });

  it("recarrega fill-gap remontando a frase e alinhando as respostas", () => {
    const draft = toQuestionDraft("fill-gap", { id: "q9", parts: ["Ele ", " na escola."], correctAnswers: ["estuda"] }, "x");

    expect(draft.sentence).toBe("Ele ___ na escola.");
    expect(draft.correctAnswers).toEqual(["estuda"]);
  });

  it("usa o id de reserva quando o registro não tem id", () => {
    expect(toQuestionDraft("flashcard", { front: "a", back: "b" }, "fallback").id).toBe("fallback");
  });

  it("garante ao menos duas opções mesmo se o registro salvo tiver menos", () => {
    expect(toQuestionDraft("multiple-choice", { id: "q9", options: ["a"] }, "x").options).toEqual(["", ""]);
  });
});

describe("isQuestionDraftComplete", () => {
  it("aprova múltipla escolha coerente", () => {
    expect(
      isQuestionDraftComplete("multiple-choice", { ...base, question: "Bom dia?", options: ["a", "b"], correctAnswer: "a" })
    ).toBe(true);
  });

  it("recusa múltipla escolha sem resposta entre as opções, com opção vazia ou repetida", () => {
    const filled = { ...base, question: "Bom dia?", options: ["a", "b"] };
    expect(isQuestionDraftComplete("multiple-choice", { ...filled, correctAnswer: "c" })).toBe(false);
    expect(isQuestionDraftComplete("multiple-choice", { ...filled, options: ["a", ""], correctAnswer: "a" })).toBe(false);
    expect(isQuestionDraftComplete("multiple-choice", { ...filled, options: ["a", "a"], correctAnswer: "a" })).toBe(false);
  });

  it("exige lacuna e resposta para cada uma no fill-gap", () => {
    expect(isQuestionDraftComplete("fill-gap", { ...base, sentence: "Ele ___ hoje.", correctAnswers: ["estuda"] })).toBe(true);
    expect(isQuestionDraftComplete("fill-gap", { ...base, sentence: "Sem lacuna.", correctAnswers: [] })).toBe(false);
    expect(isQuestionDraftComplete("fill-gap", { ...base, sentence: "Ele ___ hoje.", correctAnswers: [" "] })).toBe(false);
  });

  it("exige frente e verso no flashcard", () => {
    expect(isQuestionDraftComplete("flashcard", { ...base, front: "a", back: "b" })).toBe(true);
    expect(isQuestionDraftComplete("flashcard", { ...base, front: "a", back: " " })).toBe(false);
  });
});
