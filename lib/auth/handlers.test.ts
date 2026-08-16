import { describe, expect, it, vi } from "vitest";
import {
  handleForgotPassword,
  handleLogin,
  handleLogout,
  handleRegister,
  handleSession,
} from "./handlers";
import type { AuthUser } from "./contracts";

const user: AuthUser = { id: 1, email: "user@example.com", username: "user", confirmed: true, blocked: false };

describe("auth handlers", () => {
  it("retorna usuario publico e cookies no login", async () => {
    const client = {
      login: vi.fn(async () => ({
        ok: true as const,
        data: { user, tokens: { accessToken: "access", refreshToken: "refresh" } },
      })),
    };

    await expect(
      handleLogin(
        new Request("https://app.example.com/api/auth/login", {
          method: "POST",
          headers: { Origin: "https://app.example.com" },
          body: JSON.stringify({ email: " User@Example.com ", password: "secret123" }),
        }),
        { client, siteUrl: "https://app.example.com", secureCookies: true }
      )
    ).resolves.toEqual({
      status: 200,
      body: { ok: true, user },
      cookies: expect.arrayContaining([
        expect.objectContaining({ name: "fluent_too_access", value: "access" }),
        expect.objectContaining({ name: "fluent_too_refresh", value: "refresh" }),
      ]),
    });
  });

  it("mapeia credenciais invalidas", async () => {
    const client = {
      login: vi.fn(async () => ({ ok: false as const, error: "INVALID_CREDENTIALS" as const, status: 400 })),
    };

    await expect(
      handleLogin(
        new Request("https://app.example.com/api/auth/login", {
          method: "POST",
          headers: { Origin: "https://app.example.com" },
          body: JSON.stringify({ email: "user@example.com", password: "wrongpass" }),
        }),
        { client, siteUrl: "https://app.example.com", secureCookies: true }
      )
    ).resolves.toEqual({ status: 401, body: { ok: false, error: "INVALID_CREDENTIALS" } });
  });

  it("responde recuperacao de senha de forma neutra", async () => {
    const client = { forgotPassword: vi.fn(async () => ({ ok: false as const, error: "SERVICE_UNAVAILABLE" as const, status: 503 })) };

    await expect(
      handleForgotPassword(
        new Request("https://app.example.com/api/auth/forgot-password", {
          method: "POST",
          headers: { Origin: "https://app.example.com" },
          body: JSON.stringify({ email: "user@example.com" }),
        }),
        { client, siteUrl: "https://app.example.com" }
      )
    ).resolves.toEqual({ status: 200, body: { ok: true } });
  });

  it("recusa origem nao confiavel", async () => {
    await expect(
      handleRegister(
        new Request("https://app.example.com/api/auth/register", {
          method: "POST",
          headers: { Origin: "https://evil.example" },
          body: JSON.stringify({ email: "user@example.com", password: "secret123", passwordConfirmation: "secret123" }),
        }),
        { client: { register: vi.fn() }, siteUrl: "https://app.example.com", secureCookies: true }
      )
    ).resolves.toEqual({ status: 403, body: { ok: false, error: "INVALID_ORIGIN" } });
  });

  it("limpa cookies no logout mesmo com Strapi indisponivel", async () => {
    const client = { logout: vi.fn(async () => ({ ok: false as const, error: "SERVICE_UNAVAILABLE" as const, status: 503 })) };

    await expect(handleLogout({ refreshToken: "refresh" }, { client })).resolves.toEqual({
      status: 200,
      body: { ok: true },
      cookies: expect.arrayContaining([
        expect.objectContaining({ name: "fluent_too_access", value: "" }),
        expect.objectContaining({ name: "fluent_too_refresh", value: "" }),
      ]),
    });
  });

  it("aplica tokens rotacionados na sessao", async () => {
    const client = {
      me: vi
        .fn()
        .mockResolvedValueOnce({ ok: false as const, error: "UNAUTHORIZED" as const, status: 401 })
        .mockResolvedValueOnce({ ok: true, data: user }),
      refresh: vi.fn(async () => ({ ok: true as const, data: { tokens: { accessToken: "new-access", refreshToken: "new-refresh" } } })),
    };

    await expect(handleSession({ accessToken: "old", refreshToken: "refresh" }, { client, secureCookies: true })).resolves.toEqual({
      status: 200,
      body: { ok: true, user },
      cookies: expect.arrayContaining([expect.objectContaining({ value: "new-access" })]),
    });
  });
});
