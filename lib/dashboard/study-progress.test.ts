import { describe, expect, it } from "vitest";
import { levelReach, recommendQuizzes, summarizeAttempts } from "./study-progress";
import type { QuizAttempt } from "@/lib/quiz-attempts/types";

function attempt(overrides: Partial<QuizAttempt> & { id: number }): QuizAttempt {
  return {
    quizSlug: `quiz-${overrides.id}`,
    quizTitle: "Quiz",
    targetLanguage: "en",
    level: "A1",
    quizType: "multiple-choice",
    score: 50,
    correctCount: 1,
    incorrectCount: 1,
    totalCount: 2,
    completedAt: "2026-08-01T10:00:00.000Z",
    ...overrides,
  } as QuizAttempt;
}

const attempts: QuizAttempt[] = [
  attempt({ id: 1, targetLanguage: "en", level: "A1", score: 60, completedAt: "2026-08-01T10:00:00.000Z" }),
  attempt({ id: 2, targetLanguage: "en", level: "B1", score: 90, completedAt: "2026-08-05T10:00:00.000Z" }),
  attempt({ id: 3, targetLanguage: "fr", level: "A2", score: 30, completedAt: "2026-08-03T10:00:00.000Z" }),
];

describe("resumo do estudo", () => {
  it("devolve zeros sem tentativas", () => {
    expect(summarizeAttempts([])).toMatchObject({ total: 0, averageScore: 0, bestScore: 0, lastAttempt: null, byLanguage: [] });
  });

  it("calcula média, melhor nota e dominados", () => {
    const summary = summarizeAttempts(attempts);
    expect(summary).toMatchObject({ total: 3, averageScore: 60, bestScore: 90, masteredCount: 1 });
  });

  it("agrupa por idioma ordenando pelo mais praticado", () => {
    const summary = summarizeAttempts(attempts);
    expect(summary.byLanguage.map((entry) => entry.language)).toEqual(["en", "fr"]);
    expect(summary.byLanguage[0]).toMatchObject({ attempts: 2, averageScore: 75, bestScore: 90, topLevel: "B1" });
  });

  it("aponta a tentativa mais recente mesmo fora de ordem", () => {
    expect(summarizeAttempts(attempts).lastAttempt?.quizSlug).toBe("quiz-2");
  });

  it("usa createdAt quando não há completedAt", () => {
    const summary = summarizeAttempts([
      attempt({ id: 9, completedAt: undefined, createdAt: "2026-08-09T10:00:00.000Z" }),
      ...attempts,
    ]);
    expect(summary.lastAttempt?.quizSlug).toBe("quiz-9");
  });

  it("não repete slug na lista de praticados", () => {
    const summary = summarizeAttempts([attempt({ id: 1 }), attempt({ id: 1 })]);
    expect(summary.practicedSlugs).toEqual(["quiz-1"]);
  });

  it("reporta o nível mais alto alcançado", () => {
    expect(levelReach(summarizeAttempts(attempts))).toBe("B1");
    expect(levelReach(summarizeAttempts([]))).toBeNull();
  });
});

describe("recomendação", () => {
  const catalogo = [
    { id: "quiz-2", level: "B1" as const, targetLanguage: "en" as const },
    { id: "novo-fr", level: "C1" as const, targetLanguage: "fr" as const },
    { id: "novo-en", level: "A2" as const, targetLanguage: "en" as const },
    { id: "novo-pt", level: "A1" as const, targetLanguage: "pt" as const },
  ];

  it("prioriza o idioma mais praticado e o nível mais baixo", () => {
    const summary = summarizeAttempts(attempts);
    expect(recommendQuizzes(catalogo, summary, 2).map((quiz) => quiz.id)).toEqual(["novo-en", "novo-fr"]);
  });

  it("descarta o que o aluno já respondeu", () => {
    const summary = summarizeAttempts(attempts);
    expect(recommendQuizzes(catalogo, summary, 4).map((quiz) => quiz.id)).not.toContain("quiz-2");
  });

  it("cai para o catálogo inteiro quando tudo já foi feito", () => {
    const summary = summarizeAttempts([attempt({ id: 1, quizSlug: "novo-en" })]);
    expect(recommendQuizzes([{ id: "novo-en", level: "A2" as const, targetLanguage: "en" as const }], summary, 3)).toHaveLength(1);
  });

  it("sem histórico devolve os primeiros do catálogo por nível", () => {
    expect(recommendQuizzes(catalogo, summarizeAttempts([]), 2).map((quiz) => quiz.id)).toEqual(["novo-pt", "novo-en"]);
  });
});
