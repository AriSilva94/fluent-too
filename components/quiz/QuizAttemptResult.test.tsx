import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QuizAttemptResult from "./QuizAttemptResult";
import type { Dictionary } from "@/lib/getDictionary";
import type { Quiz, QuizResult } from "@/lib/quizzes/types";

const dict = {
  quizzes: {
    saveSuccess: "Resultado salvo.",
    saveFailed: "Nao foi possivel salvar.",
    saveSignInTitle: "Crie uma conta",
    saveSignInSubtitle: "Entre para salvar seu historico.",
    createAccount: "Criar conta",
    signIn: "Entrar",
    retry: "Tentar novamente",
    result: "Resultado",
    score: "Pontuacao",
    correctAnswers: "Corretas",
    wrongAnswers: "Incorretas",
    goodEffort: "Bom esforco",
    perfectScore: "Perfeito",
    greatJob: "Muito bem",
    resultSummary: "{correct} de {total}",
    tryAgain: "Tentar novamente",
    backToQuizzes: "Voltar",
  },
} as unknown as Dictionary;

const quiz: Quiz = {
  id: "a1-en-days-mc",
  title: "Days",
  description: "Days quiz",
  level: "A1",
  type: "multiple-choice",
  targetLanguage: "en",
  questions: [
    {
      id: "q1",
      question: "Monday",
      options: ["Monday", "Tuesday"],
      correctAnswer: "Monday",
    },
  ],
};

const result: QuizResult = {
  score: 100,
  correctCount: 1,
  incorrectCount: 0,
  totalCount: 1,
};

describe("QuizAttemptResult", () => {
  it("nao salva historico ao montar", () => {
    const fetcher = vi.spyOn(globalThis, "fetch");

    render(
      <QuizAttemptResult
        quiz={quiz}
        result={result}
        saveState="idle"
        onRetry={vi.fn()}
        dict={dict}
        locale="pt-br"
      />
    );

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockRestore();
  });
});
