import { describe, expect, it } from "vitest";
import { decideAuthNavigation } from "./proxy";

describe("decideAuthNavigation", () => {
  it("redireciona dashboard sem sessao para login com returnTo", () => {
    expect(decideAuthNavigation("/pt-br/dashboard", "anonymous", "https://api.example.com")).toEqual({
      type: "redirect",
      location: "/pt-br/login?returnTo=%2Fpt-br%2Fdashboard",
    });
  });

  it("redireciona login autenticado para dashboard", () => {
    expect(decideAuthNavigation("/pt-br/login", "authenticated", "https://api.example.com")).toEqual({
      type: "redirect",
      location: "/pt-br/dashboard",
    });
  });

  it("redireciona admin para Strapi nativo", () => {
    expect(decideAuthNavigation("/pt-br/admin", "anonymous", "https://api.example.com")).toEqual({
      type: "redirect",
      location: "https://api.example.com/admin",
    });
  });

  it("mantem rotas publicas", () => {
    expect(decideAuthNavigation("/pt-br/quizzes", "anonymous", "https://api.example.com")).toEqual({ type: "next" });
  });
});
