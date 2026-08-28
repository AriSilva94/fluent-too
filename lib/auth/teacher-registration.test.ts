import { describe, expect, it } from "vitest";
import { validateAttachment, validateTeacherRegister } from "./teacher-registration";

const valid = {
  email: "Prof@Example.com",
  password: "senha-forte-123",
  passwordConfirmation: "senha-forte-123",
  bio: "Professor de inglês.",
  experience: "CELTA, 8 anos.",
  languages: ["en"],
};

describe("validação do cadastro de professor", () => {
  it("aceita payload completo normalizando o e-mail", () => {
    const result = validateTeacherRegister(valid);

    expect(result).toEqual({ ok: true, data: { ...valid, email: "prof@example.com" } });
  });

  it("reaproveita as regras de senha do registro comum", () => {
    const result = validateTeacherRegister({ ...valid, passwordConfirmation: "outra" });

    expect(result).toEqual({ ok: false, fieldErrors: { passwordConfirmation: "PASSWORDS_DO_NOT_MATCH" } });
  });

  it("exige bio, experiência e idioma", () => {
    expect(validateTeacherRegister({ ...valid, bio: " " })).toEqual({ ok: false, fieldErrors: { bio: "REQUIRED" } });
    expect(validateTeacherRegister({ ...valid, experience: "" })).toEqual({
      ok: false,
      fieldErrors: { experience: "REQUIRED" },
    });
    expect(validateTeacherRegister({ ...valid, languages: [] })).toEqual({
      ok: false,
      fieldErrors: { languages: "REQUIRED" },
    });
  });
});

describe("validação do anexo", () => {
  it("aceita ausência de anexo", () => {
    expect(validateAttachment(null)).toEqual({ ok: true });
  });

  it("recusa arquivo acima de 5 MB", () => {
    expect(validateAttachment({ size: 5 * 1024 * 1024 + 1, type: "application/pdf" })).toEqual({
      ok: false,
      error: "FILE_TOO_LARGE",
    });
  });

  it("recusa tipo não permitido", () => {
    expect(validateAttachment({ size: 1000, type: "application/x-msdownload" })).toEqual({
      ok: false,
      error: "INVALID_FILE_TYPE",
    });
  });

  it("aceita pdf, png e jpeg", () => {
    expect(validateAttachment({ size: 1000, type: "application/pdf" })).toEqual({ ok: true });
    expect(validateAttachment({ size: 1000, type: "image/png" })).toEqual({ ok: true });
    expect(validateAttachment({ size: 1000, type: "image/jpeg" })).toEqual({ ok: true });
  });
});
