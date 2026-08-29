import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DashboardAdminActions from "./DashboardAdminActions";

const labels = {
  title: "Painel administrativo",
  subtitle: "Gerencie conteúdo, usuários e configurações.",
  teachersTitle: "Candidaturas de professores",
};

describe("DashboardAdminActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("mostra o acesso de candidaturas para super admin", () => {
    render(<DashboardAdminActions locale="pt-br" role="super_admin" labels={labels} />);

    expect(screen.getByRole("heading", { name: "Painel administrativo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Candidaturas de professores" })).toHaveAttribute(
      "href",
      "/pt-br/admin/teachers"
    );
  });

  it("nao mostra o acesso de candidaturas para aluno", () => {
    render(<DashboardAdminActions locale="pt-br" role="student" labels={labels} />);

    expect(screen.queryByRole("link", { name: "Candidaturas de professores" })).not.toBeInTheDocument();
  });
});
