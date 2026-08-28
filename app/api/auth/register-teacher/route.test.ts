import { describe, expect, it } from "vitest";
import { isBodyWithinLimit, MAX_REGISTER_TEACHER_BODY_BYTES, POST } from "./route";

describe("limite de corpo do cadastro de professor", () => {
  it("aceita um corpo dentro do limite", () => {
    expect(isBodyWithinLimit(String(5 * 1024 * 1024))).toBe(true);
    expect(isBodyWithinLimit(String(MAX_REGISTER_TEACHER_BODY_BYTES))).toBe(true);
  });

  it("recusa um corpo acima do limite", () => {
    expect(isBodyWithinLimit(String(MAX_REGISTER_TEACHER_BODY_BYTES + 1))).toBe(false);
    expect(isBodyWithinLimit(String(500 * 1024 * 1024))).toBe(false);
  });

  it("recusa corpo sem content-length ou com valor inválido", () => {
    expect(isBodyWithinLimit(null)).toBe(false);
    expect(isBodyWithinLimit("abc")).toBe(false);
  });

  it("responde FILE_TOO_LARGE sem materializar o formData", async () => {
    const request = new Request("http://localhost/api/auth/register-teacher", {
      method: "POST",
      headers: { "content-length": String(500 * 1024 * 1024) },
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
});
