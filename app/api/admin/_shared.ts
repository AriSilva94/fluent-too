import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import type { AuthTokens, AuthUser } from "@/lib/auth/contracts";
import { getSiteUrl, isTrustedOrigin } from "@/lib/auth/request";
import { canManageContent } from "@/lib/auth/roles";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";

export type AdminGuard =
  | { response: NextResponse }
  | { accessToken: string; user: AuthUser; refreshed: AuthTokens | null };

export type AuthorizedAdminGuard = Extract<AdminGuard, { accessToken: string }>;

export async function authorizeAdminRequest(
  request: Request,
  options: { requireTrustedOrigin: boolean }
): Promise<AdminGuard> {
  if (options.requireTrustedOrigin && !isTrustedOrigin(request.headers.get("origin"), getSiteUrl(request))) {
    return { response: NextResponse.json({ ok: false, error: "INVALID_ORIGIN" }, { status: 403 }) };
  }

  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (isAnonymousSession(session)) {
    return { response: NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 }) };
  }

  if (!canManageContent(session.user.role?.type)) {
    return { response: NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 }) };
  }

  const accessToken = wasSessionRefreshed(session) ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) {
    return { response: NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 }) };
  }

  return {
    accessToken,
    user: session.user,
    refreshed: wasSessionRefreshed(session) ? session.tokens : null,
  };
}

export function withAdminCookies(request: Request, guard: AuthorizedAdminGuard, response: NextResponse) {
  if (guard.refreshed) {
    applyCookies(response, buildCookieInstructions(guard.refreshed, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
