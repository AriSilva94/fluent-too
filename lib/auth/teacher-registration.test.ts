import { describe, expect, it } from "vitest";
import { validateAttachment, validateTeacherApplication } from "./teacher-registration";

const valid = {
  bio: "Professor de inglês.",
  experience: "CELTA, 8 anos.",
  languages: ["en"],
};

describe("validação da candidatura de professor", () => {
  it("aceita payload completo", () => {
    const result = validateTeacherApplication(valid);

    expect(result).toEqual({ ok: true, data: valid });
  });

  it("mantém a URL de credencial quando informada", () => {
    const result = validateTeacherApplication({ ...valid, credentialUrl: "https://example.com/cert" });

    expect(result).toEqual({ ok: true, data: { ...valid, credentialUrl: "https://example.com/cert" } });
  });

  it("exige bio, experiência e idioma", () => {
    expect(validateTeacherApplication({ ...valid, bio: " " })).toEqual({ ok: false, fieldErrors: { bio: "REQUIRED" } });
    expect(validateTeacherApplication({ ...valid, experience: "" })).toEqual({
      ok: false,
      fieldErrors: { experience: "REQUIRED" },
    });
    expect(validateTeacherApplication({ ...valid, languages: [] })).toEqual({
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
