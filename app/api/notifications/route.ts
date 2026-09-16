import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { createNotificationsClient, EMPTY_FEED } from "@/lib/notifications/client";

export async function GET(request: Request) {
  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (isAnonymousSession(session)) return NextResponse.json({ ok: false, data: EMPTY_FEED }, { status: 401 });

  const accessToken = wasSessionRefreshed(session) ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, data: EMPTY_FEED }, { status: 401 });

  const result = await createNotificationsClient().list(accessToken);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, data: EMPTY_FEED, error: result.error }, { status: 502 });

  if (wasSessionRefreshed(session)) {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
