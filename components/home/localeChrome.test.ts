import { describe, expect, it } from "vitest";
import { isAuthSurfacePath } from "./localeChrome";

describe("locale chrome", () => {
  it("identifica telas publicas do fluxo de autenticacao", () => {
    expect(isAuthSurfacePath("/pt-br/login")).toBe(true);
    expect(isAuthSurfacePath("/pt-br/register")).toBe(true);
    expect(isAuthSurfacePath("/pt-br/forgot-password")).toBe(true);
    expect(isAuthSurfacePath("/pt-br/email-confirmation")).toBe(true);
    expect(isAuthSurfacePath("/pt-br/auth/reset-password")).toBe(true);
    expect(isAuthSurfacePath("/pt-br/auth/email-confirmed")).toBe(true);
  });

  it("mantem footer em paginas internas que nao sao fluxo publico de auth", () => {
    expect(isAuthSurfacePath("/pt-br/dashboard")).toBe(false);
    expect(isAuthSurfacePath("/pt-br/dashboard/security")).toBe(false);
    expect(isAuthSurfacePath("/pt-br/quizzes")).toBe(false);
  });
});
