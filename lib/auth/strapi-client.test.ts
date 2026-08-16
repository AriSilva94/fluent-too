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
});
