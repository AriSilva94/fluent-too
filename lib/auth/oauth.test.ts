import { describe, expect, it, vi } from "vitest";
import { buildGoogleStartUrl, handleGoogleCallback, parseGoogleCallback } from "./oauth";
import type { AuthUser } from "./contracts";

const user: AuthUser = { id: 1, email: "user@example.com", username: "user", confirmed: true, blocked: false };

function encodeState(nonce: string, returnTo: string) {
  return Buffer.from(JSON.stringify({ n: nonce, r: returnTo }), "utf8").toString("base64url");
}

describe("google oauth", () => {
  it("cria URL inicial no Strapi com callback, destino interno e nonce assinado no state", () => {
    const url = buildGoogleStartUrl(
      "https://api.example.com",
      "https://app.example.com/api/auth/google/callback",
      "/pt-br/dashboard",
      "nonce-123"
    );

    expect(url).toContain("/api/connect/google");
    expect(decodeURIComponent(url)).toContain("callback=https://app.example.com/api/auth/google/callback");
    const state = new URL(url).searchParams.get("state");
    expect(state).toBe(encodeState("nonce-123", "/pt-br/dashboard"));
  });

  it("normaliza callback com erro", () => {
    expect(parseGoogleCallback(new URL("https://app.example.com/api/auth/google/callback?error=access_denied"))).toEqual({
      ok: false,
      code: "GOOGLE_AUTH_FAILED",
    });
  });

  it("rejeita callback sem nonce esperado (cookie ausente/expirado)", () => {
    const state = encodeState("nonce-123", "/pt-br/dashboard");
    expect(
      parseGoogleCallback(new URL(`https://app.example.com/api/auth/google/callback?access_token=google-token&state=${state}`))
    ).toEqual({ ok: false, code: "OAUTH_STATE_MISMATCH" });
  });

  it("rejeita callback quando o nonce do state não bate com o cookie", () => {
    const state = encodeState("attacker-nonce", "/pt-br/dashboard");
    expect(
      parseGoogleCallback(
        new URL(`https://app.example.com/api/auth/google/callback?access_token=google-token&state=${state}`),
        "victim-nonce"
      )
    ).toEqual({ ok: false, code: "OAUTH_STATE_MISMATCH" });
  });

  it("troca access token no Strapi e redireciona sem parametros sensiveis quando o nonce bate", async () => {
    const client = {
      googleCallback: vi.fn(async () => ({
        ok: true as const,
        data: { user, tokens: { accessToken: "strapi-access", refreshToken: "strapi-refresh" } },
      })),
    };
    const state = encodeState("nonce-123", "/pt-br/dashboard");

    await expect(
      handleGoogleCallback(
        new URL(`https://app.example.com/api/auth/google/callback?access_token=google-token&state=${state}`),
        { client, secureCookies: true, expectedNonce: "nonce-123" }
      )
    ).resolves.toEqual({
      status: 302,
      redirectTo: "/pt-br/dashboard",
      cookies: expect.arrayContaining([expect.objectContaining({ value: "strapi-access" })]),
    });
    expect(client.googleCallback).toHaveBeenCalledWith("google-token");
  });

  it("nunca troca o access token quando o nonce não bate", async () => {
    const client = { googleCallback: vi.fn() };
    const state = encodeState("attacker-nonce", "/pt-br/dashboard");

    const result = await handleGoogleCallback(
      new URL(`https://app.example.com/api/auth/google/callback?access_token=google-token&state=${state}`),
      { client, secureCookies: true, expectedNonce: "victim-nonce" }
    );

    expect(result.redirectTo).toContain("error=OAUTH_STATE_MISMATCH");
    expect(client.googleCallback).not.toHaveBeenCalled();
  });
});
