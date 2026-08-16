import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { getSiteUrl } from "@/lib/auth/request";
import type { CookieInstruction } from "@/lib/auth/cookies";

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
