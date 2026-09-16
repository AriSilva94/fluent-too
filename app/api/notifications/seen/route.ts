import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { getSiteUrl, isTrustedOrigin } from "@/lib/auth/request";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { createNotificationsClient } from "@/lib/notifications/client";

export async function POST(request: Request) {
  if (!isTrustedOrigin(request.headers.get("origin"), getSiteUrl(request))) {
    return NextResponse.json({ ok: false, error: "INVALID_ORIGIN" }, { status: 403 });
  }

  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (isAnonymousSession(session)) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const accessToken = wasSessionRefreshed(session) ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  const result = await createNotificationsClient().markSeen(accessToken);
  const response = result.ok
    ? NextResponse.json({ ok: true, seenAt: result.seenAt })
    : NextResponse.json({ ok: false, error: result.error }, { status: 502 });

  if (wasSessionRefreshed(session)) {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
