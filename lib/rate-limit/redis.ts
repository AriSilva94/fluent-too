import { Redis } from "ioredis";

export type RateLimiterClient = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
};

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

let sharedClient: Redis | null | undefined;

// Lazy + memoizado: uma conexão por processo, criada só quando o primeiro limite é
// checado. `REDIS_URL` ausente é tratado como "sem Redis configurado", não como erro.
function getSharedClient(): Redis | null {
  if (sharedClient !== undefined) return sharedClient;
  const url = process.env.REDIS_URL;
  if (!url) {
    sharedClient = null;
    return sharedClient;
  }
  sharedClient = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
  sharedClient.on("error", (error) => {
    console.error("Conexao com Redis falhou (rate limit)", error);
  });
  return sharedClient;
}

/**
 * Janela fixa por chave (ex.: `login:203.0.113.4`): incrementa um contador com TTL
 * e barra quando passa do limite. Sem `REDIS_URL` ou com o Redis fora do ar, a
 * checagem falha aberta (não bloqueia login) — perde a proteção contra força bruta,
 * mas não derruba a autenticação inteira por causa de uma dependência opcional.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  client: RateLimiterClient | null = getSharedClient()
): Promise<RateLimitResult> {
  if (!client) return { allowed: true };

  try {
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, windowSeconds);

    if (count > limit) {
      const ttl = await client.ttl(key);
      return { allowed: false, retryAfterSeconds: ttl > 0 ? ttl : windowSeconds };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Falha ao checar rate limit, liberando por padrao", error);
    return { allowed: true };
  }
}
