import { Redis } from "ioredis";

export type RateLimiterClient = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
};

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

let sharedClient: Redis | null | undefined;

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
