import { describe, expect, it } from "vitest";
import type { Dictionary } from "@/lib/getDictionary";
import { createEmptyQuestion } from "./editor";
import { draftToQuiz, previewSignature, type QuizDraft } from "./preview";
import { QUIZ_LEVEL, QUIZ_TYPE, TARGET_LANGUAGE, type QuizType } from "./types";

const dict = {
  teacher: {
    previewUntitled: "Quiz sem título",
    previewNoDescription: "Sem descrição",
    previewQuestion: "Enunciado da questão {n}",
    previewOption: "Alternativa {n}",
    previewSentence: "Frase da questão {n}",
    previewCardFront: "Frente do card {n}",
    previewCardBack: "Verso do card {n}",
  },
} as unknown as Dictionary;

function draft(type: QuizType, questions = [createEmptyQuestion("q-1")]): QuizDraft {
  return {
    title: "",
    description: "",
    targetLanguage: TARGET_LANGUAGE.pt,
    level: QUIZ_LEVEL.a1,
    type,
    estimatedMinutes: "",
    isPublic: true,
    questions,
  };
}

describe("pré-visualização do quiz em edição", () => {
  it("preenche título e descrição vazios com texto de apoio", () => {
    const quiz = draftToQuiz(draft(QUIZ_TYPE.multipleChoice), dict);

    expect(quiz.title).toBe("Quiz sem título");
    expect(quiz.description).toBe("Sem descrição");
  });

  it("mantém o que o professor já escreveu", () => {
    const quiz = draftToQuiz({ ...draft(QUIZ_TYPE.multipleChoice), title: "  Present Simple  " }, dict);

    expect(quiz.title).toBe("Present Simple");
  });

  it("dá texto de apoio a enunciado e alternativas vazios", () => {
    const quiz = draftToQuiz(draft(QUIZ_TYPE.multipleChoice), dict);

    expect(quiz.type).toBe(QUIZ_TYPE.multipleChoice);
    expect(quiz.questions[0].question).toBe("Enunciado da questão 1");
    expect(quiz.questions[0]).toMatchObject({ options: ["Alternativa 1", "Alternativa 2"] });
  });

  it("gera uma lacuna mesmo quando a frase ainda não tem ___", () => {
    const question = { ...createEmptyQuestion("q-1"), sentence: "Ela ___ português" };
    const semLacuna = { ...createEmptyQuestion("q-1"), sentence: "Ela fala português" };

    const comGap = draftToQuiz(draft(QUIZ_TYPE.fillGap, [question]), dict);
    const semGap = draftToQuiz(draft(QUIZ_TYPE.fillGap, [semLacuna]), dict);
    const vazio = draftToQuiz(draft(QUIZ_TYPE.fillGap), dict);

    expect(comGap.questions[0]).toMatchObject({ parts: ["Ela ", " português"] });
    expect(semGap.questions[0]).toMatchObject({ parts: ["Ela fala português", ""], correctAnswers: [""] });
    expect(vazio.questions[0]).toMatchObject({ parts: ["Frase da questão 1", ""] });
  });

  it("mostra frente e verso de apoio no flashcard vazio", () => {
    const quiz = draftToQuiz(draft(QUIZ_TYPE.flashcard), dict);

    expect(quiz.questions[0]).toMatchObject({ front: "Frente do card 1", back: "Verso do card 1" });
    expect(quiz.questions[0].question).toBe("Frente do card 1");
  });

  it("só muda de assinatura quando tipo ou quantidade de questões muda", () => {
    const base = draft(QUIZ_TYPE.flashcard);

    expect(previewSignature({ ...base, title: "outro" })).toBe(previewSignature(base));
    expect(previewSignature({ ...base, type: QUIZ_TYPE.fillGap })).not.toBe(previewSignature(base));
    expect(previewSignature({ ...base, questions: [...base.questions, createEmptyQuestion("q-2")] })).not.toBe(
      previewSignature(base)
    );
  });
});
