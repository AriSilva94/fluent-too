import { describe, expect, it, vi } from "vitest";
import { buildGoogleCallbackUrl, buildGoogleStartUrl, handleGoogleCallback, parseGoogleCallback } from "./oauth";
import type { AuthUser } from "./contracts";

const NONCE = "0123456789abcdef0123456789abcdef";
const valid = { expected: NONCE, received: NONCE };

const user: AuthUser = { id: 1, email: "user@example.com", username: "user", confirmed: true, blocked: false };

describe("google oauth", () => {
  it("cria URL inicial no Strapi com callback e destino interno", () => {
    const url = buildGoogleStartUrl(
      "https://api.example.com",
      "https://app.example.com/api/auth/google/callback",
      "/pt-br/dashboard"
    );

    expect(url).toContain("/api/connect/google");
    expect(decodeURIComponent(url)).toContain("callback=https://app.example.com/api/auth/google/callback");
    expect(decodeURIComponent(url)).toContain("state=/pt-br/dashboard");
  });

  it("normaliza callback com erro", () => {
    expect(
      parseGoogleCallback(new URL("https://app.example.com/api/auth/google/callback?error=access_denied"), valid)
    ).toEqual({ ok: false, code: "GOOGLE_AUTH_FAILED" });
  });

  it("rejeita callback sem o cookie de nonce (navegador nunca iniciou o fluxo por aqui)", () => {
    expect(
      parseGoogleCallback(new URL("https://app.example.com/api/auth/google/callback?access_token=google-token"), { received: NONCE })
    ).toEqual({ ok: false, code: "OAUTH_STATE_MISMATCH" });
  });

  it("rejeita callback cujo nonce do caminho não bate com o cookie (link forjado)", () => {
    expect(
      parseGoogleCallback(new URL("https://app.example.com/api/auth/google/callback?access_token=google-token"), {
        expected: NONCE,
        received: "ffffffffffffffffffffffffffffffff",
      })
    ).toEqual({ ok: false, code: "OAUTH_STATE_MISMATCH" });
  });

  it("monta callback com nonce no caminho, que o Strapi preserva", () => {
    expect(buildGoogleCallbackUrl("https://app.example.com/", NONCE)).toBe(`https://app.example.com/api/auth/google/callback/${NONCE}`);
  });

  it("aceita callback com nonce igual ao cookie, mesmo sem state na URL", () => {
    expect(
      parseGoogleCallback(new URL("https://app.example.com/api/auth/google/callback?access_token=google-token"), valid)
    ).toEqual({ ok: true, accessToken: "google-token", returnTo: "/pt-br/dashboard" });
  });

  it("troca access token no Strapi e redireciona sem parametros sensiveis quando o cookie de nonce esta presente", async () => {
    const client = {
      googleCallback: vi.fn(async () => ({
        ok: true as const,
        data: { user, tokens: { accessToken: "strapi-access", refreshToken: "strapi-refresh" } },
      })),
    };

    await expect(
      handleGoogleCallback(new URL("https://app.example.com/api/auth/google/callback?access_token=google-token"), {
        client,
        secureCookies: true,
        nonce: valid,
      })
    ).resolves.toEqual({
      status: 302,
      redirectTo: "/pt-br/dashboard",
      cookies: expect.arrayContaining([expect.objectContaining({ value: "strapi-access" })]),
    });
    expect(client.googleCallback).toHaveBeenCalledWith("google-token");
  });

  it("nunca troca o access token quando o cookie de nonce nao esta presente", async () => {
    const client = { googleCallback: vi.fn() };

    const result = await handleGoogleCallback(
      new URL("https://app.example.com/api/auth/google/callback?access_token=google-token"),
      { client, secureCookies: true, nonce: { received: NONCE } }
    );

    expect(result.redirectTo).toContain("error=OAUTH_STATE_MISMATCH");
    expect(client.googleCallback).not.toHaveBeenCalled();
  });
});
