import { describe, expect, it } from "vitest";
import { validateLogin } from "./validation";

describe("validateLogin", () => {
  it("normaliza o e-mail antes de aceitar as credenciais", () => {
    expect(validateLogin({ email: " Aluno@Example.com ", password: "secret123" })).toEqual({
      ok: true,
      data: { email: "aluno@example.com", password: "secret123" },
    });
  });
});
