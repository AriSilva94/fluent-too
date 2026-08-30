import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, generateNonce } from "./csp";

describe("generateNonce", () => {
  it("gera nonces diferentes a cada chamada", () => {
    expect(generateNonce()).not.toBe(generateNonce());
  });
});

describe("buildContentSecurityPolicy", () => {
  it("usa nonce e strict-dynamic no script-src, sem unsafe-inline", () => {
    const csp = buildContentSecurityPolicy("abc123", "https://api.example.com");

    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  });

  it("libera o Strapi publico em connect-src", () => {
    const csp = buildContentSecurityPolicy("abc123", "https://api.example.com");
    expect(csp).toContain("connect-src 'self' https://api.example.com");
  });

  it("mantem unsafe-inline so no style-src-attr, com nonce no style-src-elem", () => {
    const csp = buildContentSecurityPolicy("abc123", "https://api.example.com");
    expect(csp).toContain("style-src-elem 'self' 'nonce-abc123' 'unsafe-inline'");
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
  });
});
