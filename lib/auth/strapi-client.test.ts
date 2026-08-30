import { describe, expect, it, vi } from "vitest";
import { createStrapiClient } from "./strapi-client";

describe("createStrapiClient", () => {
  it("envia login para URL interna e normaliza resposta", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      jwt: "access",
      refreshToken: "refresh",
      user: { id: 1, email: "user@example.com", username: "user", confirmed: true, blocked: false },
    })));
    const client = createStrapiClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.login({ email: "user@example.com", password: "secret123" })).resolves.toEqual({
      ok: true,
      data: {
        tokens: { accessToken: "access", refreshToken: "refresh" },
        user: { id: 1, email: "user@example.com", username: "user", confirmed: true, blocked: false },
      },
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.internal/api/auth/local",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });

  it("usa bearer token e normaliza erro nao JSON", async () => {
    const fetcher = vi.fn(async () => new Response("offline", { status: 503 }));
    const client = createStrapiClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.me("access")).resolves.toEqual({ ok: false, error: "SERVICE_UNAVAILABLE", status: 503 });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.internal/api/users/me",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer access" }),
      })
    );
  });

  it("normaliza cadastro sem tokens quando confirmacao de email esta ativa", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      user: { id: 1, email: "user@example.com", username: "user@example.com", confirmed: false, blocked: false },
    })));
    const client = createStrapiClient({ baseUrl: "https://api.internal", fetcher });

    await expect(
      client.register({
        email: "user@example.com",
        password: "secret123",
        passwordConfirmation: "secret123",
      })
    ).resolves.toEqual({
      ok: true,
      data: {
        user: { id: 1, email: "user@example.com", username: "user@example.com", confirmed: false, blocked: false },
      },
    });
  });

  it("envia bearer token na alteracao de senha", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      jwt: "new-access",
      refreshToken: "new-refresh",
      user: { id: 1, email: "user@example.com", username: "user", confirmed: true, blocked: false },
    })));
    const client = createStrapiClient({ baseUrl: "https://api.internal", fetcher });

    await client.changePassword("access", {
      currentPassword: "old-secret",
      password: "new-secret1",
      passwordConfirmation: "new-secret1",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.internal/api/auth/change-password",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer access" }),
      })
    );
  });

  it("envia bearer token no logout", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ ok: true })));
    const client = createStrapiClient({ baseUrl: "https://api.internal", fetcher });

    await expect(client.logout("access", "refresh")).resolves.toEqual({ ok: true, data: { ok: true } });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.internal/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer access" }),
      })
    );
  });
});
