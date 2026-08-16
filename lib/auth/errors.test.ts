import { describe, expect, it } from "vitest";
import { mapStrapiError } from "./errors";

describe("mapStrapiError", () => {
  it("normaliza mensagens conhecidas sem expor detalhes", () => {
    expect(mapStrapiError(400, "Invalid identifier or password")).toBe("INVALID_CREDENTIALS");
    expect(mapStrapiError(400, "Your account email is not confirmed")).toBe("EMAIL_NOT_CONFIRMED");
    expect(mapStrapiError(429, "Too Many Requests")).toBe("RATE_LIMITED");
    expect(mapStrapiError(503, "unknown")).toBe("SERVICE_UNAVAILABLE");
  });
});
