import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DashboardTeacherActions from "./DashboardTeacherActions";

const labels = {
  title: "Área do professor",
  subtitle: "Crie e edite aulas nos idiomas aprovados no seu cadastro.",
  cta: "Gerenciar meus quizzes",
};

describe("DashboardTeacherActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("mostra o acesso para professor aprovado", () => {
    render(<DashboardTeacherActions locale="pt-br" role="teacher" labels={labels} />);

    expect(screen.getByRole("link", { name: "Gerenciar meus quizzes" })).toHaveAttribute(
      "href",
      "/pt-br/teacher/quizzes"
    );
  });

  it("mostra o acesso para admin, que também cria conteúdo", () => {
    render(<DashboardTeacherActions locale="en-us" role="app_admin" labels={labels} />);

    expect(screen.getByRole("link", { name: "Gerenciar meus quizzes" })).toHaveAttribute(
      "href",
      "/en-us/teacher/quizzes"
    );
  });

  it("esconde o acesso de aluno e de professor ainda pendente", () => {
    render(<DashboardTeacherActions locale="pt-br" role="student" labels={labels} />);
    render(<DashboardTeacherActions locale="pt-br" role="teacher_pending" labels={labels} />);

    expect(screen.queryByRole("link", { name: "Gerenciar meus quizzes" })).not.toBeInTheDocument();
  });
});
