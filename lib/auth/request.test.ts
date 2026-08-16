import { describe, expect, it } from "vitest";
import { isTrustedOrigin, readLimitedJson } from "./request";

describe("request helpers", () => {
  it("valida origem confiavel", () => {
    expect(isTrustedOrigin("https://app.example.com", "https://app.example.com")).toBe(true);
    expect(isTrustedOrigin("https://evil.example", "https://app.example.com")).toBe(false);
    expect(isTrustedOrigin(null, "https://app.example.com")).toBe(true);
  });

  it("limita corpo JSON", async () => {
    const small = new Request("https://app.example.com/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@example.com" }),
    });
    await expect(readLimitedJson(small, 1024)).resolves.toEqual({ email: "a@example.com" });

    const large = new Request("https://app.example.com/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ value: "x".repeat(20000) }),
    });
    await expect(readLimitedJson(large, 1024)).rejects.toThrow("PAYLOAD_TOO_LARGE");
  });
});
