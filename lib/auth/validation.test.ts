import { describe, expect, it } from "vitest";
import {
  validateChangePassword,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "./validation";

describe("validateLogin", () => {
  it("normaliza o e-mail antes de aceitar as credenciais", () => {
    expect(validateLogin({ email: " Aluno@Example.com ", password: "secret123" })).toEqual({
      ok: true,
      data: { email: "aluno@example.com", password: "secret123" },
    });
  });
});

describe("validateRegister", () => {
  it("retorna erros de campo para e-mail invalido, senha fraca e confirmacao divergente", () => {
    expect(validateRegister({ email: "bad", password: "123", passwordConfirmation: "456" })).toEqual({
      ok: false,
      fieldErrors: {
        email: "INVALID_EMAIL",
        password: "WEAK_PASSWORD",
        passwordConfirmation: "PASSWORDS_DO_NOT_MATCH",
      },
    });
  });

  it("normaliza e aceita cadastro valido", () => {
    expect(
      validateRegister({
        email: " Aluno@Example.com ",
        password: "secret123",
        passwordConfirmation: "secret123",
      })
    ).toEqual({
      ok: true,
      data: {
        email: "aluno@example.com",
        password: "secret123",
        passwordConfirmation: "secret123",
      },
    });
  });
});

describe("password flows", () => {
  it("normaliza e-mail de recuperacao", () => {
    expect(validateForgotPassword({ email: " Aluno@Example.com " })).toEqual({
      ok: true,
      data: { email: "aluno@example.com" },
    });
  });

  it("exige codigo no reset", () => {
    expect(validateResetPassword({ code: "", password: "secret123", passwordConfirmation: "secret123" })).toEqual({
      ok: false,
      fieldErrors: { code: "REQUIRED" },
    });
  });

  it("valida alteracao de senha", () => {
    expect(
      validateChangePassword({
        currentPassword: "oldsecret",
        password: "secret123",
        passwordConfirmation: "different",
      })
    ).toEqual({
      ok: false,
      fieldErrors: { passwordConfirmation: "PASSWORDS_DO_NOT_MATCH" },
    });
  });
});
