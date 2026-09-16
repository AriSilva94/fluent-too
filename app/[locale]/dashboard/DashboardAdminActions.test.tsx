import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DashboardAdminActions from "./DashboardAdminActions";

const labels = {
  title: "Painel administrativo",
  subtitle: "Gerencie conteúdo, usuários e configurações.",
  hubCta: "Abrir painel administrativo",
  quizzesTitle: "Quizzes",
  blogTitle: "Blog",
  teachersTitle: "Candidaturas de professores",
};

describe("DashboardAdminActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("leva o admin ao painel e a cada área direto", () => {
    render(<DashboardAdminActions locale="pt-br" role="super_admin" labels={labels} />);

    expect(screen.getByRole("heading", { name: "Painel administrativo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir painel administrativo" })).toHaveAttribute("href", "/pt-br/admin");
    expect(screen.getByRole("link", { name: "Quizzes" })).toHaveAttribute("href", "/pt-br/admin/quizzes");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/pt-br/admin/blog");
    expect(screen.getByRole("link", { name: "Candidaturas de professores" })).toHaveAttribute(
      "href",
      "/pt-br/admin/teachers"
    );
  });

  it("vale também para app admin", () => {
    render(<DashboardAdminActions locale="pt-br" role="app_admin" labels={labels} />);

    expect(screen.getByRole("link", { name: "Quizzes" })).toHaveAttribute("href", "/pt-br/admin/quizzes");
  });

  it("nao mostra nada para aluno nem para professor", () => {
    render(<DashboardAdminActions locale="pt-br" role="student" labels={labels} />);
    render(<DashboardAdminActions locale="pt-br" role="teacher" labels={labels} />);

    expect(screen.queryByRole("link", { name: "Quizzes" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Abrir painel administrativo" })).not.toBeInTheDocument();
  });
});
