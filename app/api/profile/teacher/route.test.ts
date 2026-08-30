import { describe, expect, it } from "vitest";
import { isBodyWithinLimit, MAX_TEACHER_APPLICATION_BODY_BYTES, POST } from "./route";

describe("limite de corpo da candidatura de professor", () => {
  it("aceita um corpo dentro do limite", () => {
    expect(isBodyWithinLimit(String(5 * 1024 * 1024))).toBe(true);
    expect(isBodyWithinLimit(String(MAX_TEACHER_APPLICATION_BODY_BYTES))).toBe(true);
  });

  it("recusa um corpo acima do limite", () => {
    expect(isBodyWithinLimit(String(MAX_TEACHER_APPLICATION_BODY_BYTES + 1))).toBe(false);
    expect(isBodyWithinLimit(String(500 * 1024 * 1024))).toBe(false);
  });

  it("recusa corpo sem content-length ou com valor inválido", () => {
    expect(isBodyWithinLimit(null)).toBe(false);
    expect(isBodyWithinLimit("abc")).toBe(false);
  });

  it("responde FILE_TOO_LARGE sem materializar o formData", async () => {
    const request = new Request("http://localhost/api/profile/teacher", {
      method: "POST",
      headers: { "content-length": String(500 * 1024 * 1024), origin: "http://localhost" },
    });
    Object.defineProperty(request, "formData", {
      value: () => {
        throw new Error("formData não deveria ser lido");
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "FILE_TOO_LARGE" });
  });

  it("responde 401 sem token, mesmo com corpo dentro do limite", async () => {
    const request = new Request("http://localhost/api/profile/teacher", {
      method: "POST",
      headers: { "content-length": "10", origin: "http://localhost" },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
