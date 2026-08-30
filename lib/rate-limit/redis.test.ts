import { describe, expect, it, vi } from "vitest";
import { checkRateLimit, type RateLimiterClient } from "./redis";

function createFakeRedis(): RateLimiterClient & { store: Map<string, number> } {
  const store = new Map<string, number>();
  return {
    store,
    async incr(key) {
      const next = (store.get(key) ?? 0) + 1;
      store.set(key, next);
      return next;
    },
    async expire() {
      return 1;
    },
    async ttl() {
      return 60;
    },
  };
}

describe("checkRateLimit", () => {
  it("libera enquanto estiver dentro do limite", async () => {
    const client = createFakeRedis();

    await expect(checkRateLimit("login:1.2.3.4", 3, 60, client)).resolves.toEqual({ allowed: true });
    await expect(checkRateLimit("login:1.2.3.4", 3, 60, client)).resolves.toEqual({ allowed: true });
    await expect(checkRateLimit("login:1.2.3.4", 3, 60, client)).resolves.toEqual({ allowed: true });
  });

  it("barra ao ultrapassar o limite na janela", async () => {
    const client = createFakeRedis();

    for (let i = 0; i < 3; i++) await checkRateLimit("login:1.2.3.4", 3, 60, client);

    await expect(checkRateLimit("login:1.2.3.4", 3, 60, client)).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });

  it("nao mistura contadores de chaves diferentes", async () => {
    const client = createFakeRedis();

    for (let i = 0; i < 3; i++) await checkRateLimit("login:1.1.1.1", 3, 60, client);

    await expect(checkRateLimit("login:2.2.2.2", 3, 60, client)).resolves.toEqual({ allowed: true });
  });

  it("libera (fail open) quando nao ha cliente Redis configurado", async () => {
    await expect(checkRateLimit("login:1.2.3.4", 1, 60, null)).resolves.toEqual({ allowed: true });
  });

  it("libera (fail open) quando o Redis lanca erro", async () => {
    const client: RateLimiterClient = {
      incr: vi.fn(async () => {
        throw new Error("connection refused");
      }),
      expire: vi.fn(),
      ttl: vi.fn(),
    };

    await expect(checkRateLimit("login:1.2.3.4", 1, 60, client)).resolves.toEqual({ allowed: true });
  });
});
