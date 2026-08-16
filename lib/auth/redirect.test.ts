import { describe, expect, it } from "vitest";
import { safeRedirect } from "./redirect";

describe("safeRedirect", () => {
  it("rejeita destinos externos", () => {
    expect(safeRedirect("https://evil.example", "/pt-br/dashboard")).toBe("/pt-br/dashboard");
    expect(safeRedirect("//evil.example", "/pt-br/dashboard")).toBe("/pt-br/dashboard");
  });

  it("aceita apenas caminho local com uma barra inicial", () => {
    expect(safeRedirect("/pt-br/quizzes", "/pt-br/dashboard")).toBe("/pt-br/quizzes");
    expect(safeRedirect("pt-br/quizzes", "/pt-br/dashboard")).toBe("/pt-br/dashboard");
  });
});
