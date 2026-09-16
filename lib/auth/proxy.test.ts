import { describe, expect, it } from "vitest";
import { decideAuthNavigation } from "./proxy";

describe("decideAuthNavigation", () => {
  it("redireciona dashboard sem sessao para login com returnTo", () => {
    expect(decideAuthNavigation("/pt-br/dashboard", "anonymous")).toEqual({
      type: "redirect",
      location: "/pt-br/login?returnTo=%2Fpt-br%2Fdashboard",
    });
  });

  it("redireciona login autenticado para dashboard", () => {
    expect(decideAuthNavigation("/pt-br/login", "authenticated")).toEqual({
      type: "redirect",
      location: "/pt-br/dashboard",
    });
  });

  it("manda o visitante anônimo para o login em vez do painel do Strapi", () => {
    expect(decideAuthNavigation("/pt-br/admin", "anonymous")).toEqual({
      type: "redirect",
      location: "/pt-br/login?returnTo=%2Fpt-br%2Fadmin",
    });
  });

  it("deixa o admin autenticado entrar na área administrativa do próprio site", () => {
    expect(decideAuthNavigation("/pt-br/admin", "authenticated")).toEqual({ type: "next" });
    expect(decideAuthNavigation("/pt-br/admin/quizzes", "authenticated")).toEqual({
      type: "next",
    });
  });

  it("protege a área do professor", () => {
    expect(decideAuthNavigation("/pt-br/teacher/quizzes", "anonymous")).toEqual({
      type: "redirect",
      location: "/pt-br/login?returnTo=%2Fpt-br%2Fteacher%2Fquizzes",
    });
  });

  it("mantem rotas publicas", () => {
    expect(decideAuthNavigation("/pt-br/quizzes", "anonymous")).toEqual({ type: "next" });
  });
});
