import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { getSiteUrl } from "@/lib/auth/request";
import { checkRateLimit } from "@/lib/rate-limit/redis";
import type { CookieInstruction } from "@/lib/auth/cookies";

export type RateLimitConfig = { name: string; limit: number; windowSeconds: number };

/**
 * Chave por IP: `x-forwarded-for` é setado pelo proxy reverso na frente do container
 * (Traefik/Dokploy) — sem ele, todo tráfego pareceria vir do mesmo IP interno.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function enforceRateLimit(request: Request, config: RateLimitConfig): Promise<NextResponse | null> {
  const key = `rate-limit:${config.name}:${getClientIp(request)}`;
  const result = await checkRateLimit(key, config.limit, config.windowSeconds);
  if (result.allowed) return null;

  return NextResponse.json(
    { ok: false, error: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
  );
}

export function routeOptions(request: Request) {
  return {
    client: createStrapiClient(),
    siteUrl: getSiteUrl(request),
    secureCookies: resolveAuthCookieSecure(request.url),
  };
}

export function readTokenCookies(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return {
    accessToken: readCookie(cookie, AUTH_COOKIE_NAMES.access),
    refreshToken: readCookie(cookie, AUTH_COOKIE_NAMES.refresh),
  };
}

export function jsonWithCookies(result: { status: number; body: unknown; cookies?: CookieInstruction[] }) {
  const response = NextResponse.json(result.body, { status: result.status });
  applyCookies(response, result.cookies);
  return response;
}

export function applyCookies(response: NextResponse, cookies: CookieInstruction[] | undefined) {
  for (const cookie of cookies ?? []) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
}

function readCookie(header: string, name: string) {
  return header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
