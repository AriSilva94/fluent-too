import { describe, expect, it, vi } from "vitest";
import { resolveSession, resolveSessionOptimistic } from "./session";
import type { AuthUser, AuthTokens } from "./contracts";

function buildJwt(exp: number) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return `${header}.${payload}.signature`;
}

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

  it("mantem a sessao quando o cookie de refresh nao chega mas o access e aceito", async () => {
    const client = {
      me: vi.fn(async () => ({ ok: true as const, data: user })),
      refresh: vi.fn(),
    };

    await expect(resolveSession({ accessToken: "access" }, client)).resolves.toEqual({
      status: "authenticated",
      user,
    });
    expect(client.refresh).not.toHaveBeenCalled();
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

describe("resolveSessionOptimistic", () => {
  it("confia no access token ainda dentro do prazo sem chamar o Strapi", async () => {
    const client = { refresh: vi.fn() };
    const accessToken = buildJwt(Math.floor(Date.now() / 1000) + 600);

    await expect(resolveSessionOptimistic({ accessToken, refreshToken: "refresh" }, client)).resolves.toEqual({
      status: "authenticated",
    });
    expect(client.refresh).not.toHaveBeenCalled();
  });

  it("tenta renovar quando o access token expirou", async () => {
    const client = { refresh: vi.fn(async () => ({ ok: true as const, data: { tokens: rotatedTokens } })) };
    const accessToken = buildJwt(Math.floor(Date.now() / 1000) - 60);

    await expect(resolveSessionOptimistic({ accessToken, refreshToken: "refresh" }, client)).resolves.toEqual({
      status: "refreshed",
      tokens: rotatedTokens,
    });
    expect(client.refresh).toHaveBeenCalledWith("refresh");
  });

  it("limpa sessao quando o refresh falha", async () => {
    const client = { refresh: vi.fn(async () => ({ ok: false as const, error: "UNAUTHORIZED" as const, status: 401 })) };
    const accessToken = buildJwt(Math.floor(Date.now() / 1000) - 60);

    await expect(resolveSessionOptimistic({ accessToken, refreshToken: "refresh" }, client)).resolves.toEqual({
      status: "anonymous",
      clear: true,
    });
  });

  it("trata token sem claim exp decodificavel como expirado", async () => {
    const client = { refresh: vi.fn(async () => ({ ok: true as const, data: { tokens: rotatedTokens } })) };

    await expect(resolveSessionOptimistic({ accessToken: "not-a-jwt", refreshToken: "refresh" }, client)).resolves.toEqual({
      status: "refreshed",
      tokens: rotatedTokens,
    });
  });

  it("mantem a sessao quando o cookie de refresh nao chega mas o access ainda vale", async () => {
    const client = { refresh: vi.fn() };
    const accessToken = buildJwt(Math.floor(Date.now() / 1000) + 600);

    await expect(resolveSessionOptimistic({ accessToken }, client)).resolves.toEqual({ status: "authenticated" });
    expect(client.refresh).not.toHaveBeenCalled();
  });

  it("renova quando so o cookie de refresh chega", async () => {
    const client = { refresh: vi.fn(async () => ({ ok: true as const, data: { tokens: rotatedTokens } })) };

    await expect(resolveSessionOptimistic({ refreshToken: "refresh" }, client)).resolves.toEqual({
      status: "refreshed",
      tokens: rotatedTokens,
    });
  });

  it("limpa quando o access venceu e nao ha refresh", async () => {
    const client = { refresh: vi.fn() };
    const accessToken = buildJwt(Math.floor(Date.now() / 1000) - 60);

    await expect(resolveSessionOptimistic({ accessToken }, client)).resolves.toEqual({ status: "anonymous", clear: true });
    expect(client.refresh).not.toHaveBeenCalled();
  });

  it("marca anonimo sem cookies", async () => {
    const client = { refresh: vi.fn() };
    await expect(resolveSessionOptimistic({}, client)).resolves.toEqual({ status: "anonymous", clear: false });
  });
});
