import { describe, expect, it } from "vitest";
import { mapStrapiError } from "./errors";

describe("mapStrapiError", () => {
  it("normaliza mensagens conhecidas sem expor detalhes", () => {
    expect(mapStrapiError(400, "Invalid identifier or password")).toBe("INVALID_CREDENTIALS");
    expect(mapStrapiError(400, "Your account email is not confirmed")).toBe("EMAIL_NOT_CONFIRMED");
    expect(mapStrapiError(429, "Too Many Requests")).toBe("RATE_LIMITED");
    expect(mapStrapiError(503, "unknown")).toBe("SERVICE_UNAVAILABLE");
  });

  it("repassa os códigos curtos do cadastro de professor sem alteração", () => {
    expect(mapStrapiError(400, "EMAIL_ALREADY_REGISTERED")).toBe("EMAIL_ALREADY_REGISTERED");
    expect(mapStrapiError(400, "FILE_TOO_LARGE")).toBe("FILE_TOO_LARGE");
    expect(mapStrapiError(400, "INVALID_FILE_TYPE")).toBe("INVALID_FILE_TYPE");
    expect(mapStrapiError(400, "REQUIRED")).toBe("REQUIRED");
    expect(mapStrapiError(400, "INVALID_EMAIL")).toBe("INVALID_EMAIL");
    expect(mapStrapiError(400, "WEAK_PASSWORD")).toBe("WEAK_PASSWORD");
  });

  it("mapeia mensagem desconhecida para UNKNOWN_ERROR", () => {
    expect(mapStrapiError(400, "algo totalmente inesperado")).toBe("UNKNOWN_ERROR");
  });
});
