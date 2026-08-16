import { describe, expect, it, vi } from "vitest";
import { resolveSession } from "./session";
import type { AuthUser, AuthTokens } from "./contracts";

const user: AuthUser = { id: 1, email: "user@example.com", username: "user", confirmed: true, blocked: false };
const rotatedTokens: AuthTokens = { accessToken: "new-access", refreshToken: "new-refresh" };

describe("resolveSession", () => {
  it("usa access token valido sem rotacionar", async () => {
    const client = {
      me: vi.fn(async () => ({ ok: true as const, data: user })),
      refresh: vi.fn(),
    };

    await expect(resolveSession({ accessToken: "access", refreshToken: "refresh" }, client)).resolves.toEqual({
      status: "authenticated",
      user,
    });
    expect(client.refresh).not.toHaveBeenCalled();
  });

  it("rotaciona uma vez quando access token expira", async () => {
    const client = {
      me: vi
        .fn()
        .mockResolvedValueOnce({ ok: false as const, error: "UNAUTHORIZED" as const, status: 401 })
        .mockResolvedValueOnce({ ok: true, data: user }),
      refresh: vi.fn(async () => ({ ok: true as const, data: { tokens: rotatedTokens } })),
    };

    await expect(resolveSession({ accessToken: "expired", refreshToken: "refresh" }, client)).resolves.toEqual({
      status: "refreshed",
      user,
      tokens: rotatedTokens,
    });
    expect(client.refresh).toHaveBeenCalledTimes(1);
  });

  it("limpa sessao invalida", async () => {
    const client = {
      me: vi.fn(async () => ({ ok: false as const, error: "UNAUTHORIZED" as const, status: 401 })),
      refresh: vi.fn(async () => ({ ok: false as const, error: "UNAUTHORIZED" as const, status: 401 })),
    };

    await expect(resolveSession({ accessToken: "bad", refreshToken: "bad" }, client)).resolves.toEqual({
      status: "anonymous",
      clear: true,
    });
    expect(client.refresh).toHaveBeenCalledTimes(1);
  });
});
