import { NextResponse } from "next/server";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { createQuizAttemptsClient } from "@/lib/quiz-attempts/client";
import { hasProfile } from "@/lib/auth/roles";

export async function POST(request: Request) {
  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (isAnonymousSession(session)) return NextResponse.json({ ok: false }, { status: 401 });
  if (!hasProfile(session.user.role?.type)) {
    const response = NextResponse.json({ ok: false, error: "PROFILE_REQUIRED" }, { status: 403 });
    if (wasSessionRefreshed(session)) {
      applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
    }
    return response;
  }

  const body = await request.json().catch(() => null);
  const accessToken = wasSessionRefreshed(session) ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false }, { status: 401 });

  const result = await createQuizAttemptsClient().create(accessToken, body);
  const response = NextResponse.json({ ok: result.ok }, { status: result.ok ? 200 : 502 });
  if (wasSessionRefreshed(session)) {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}

export async function GET(request: Request) {
  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (isAnonymousSession(session)) return NextResponse.json({ ok: false, data: [] }, { status: 401 });

  const accessToken = wasSessionRefreshed(session) ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, data: [] }, { status: 401 });

  const result = await createQuizAttemptsClient().list(accessToken);
  const response = NextResponse.json(result, { status: result.ok ? 200 : 502 });
  if (wasSessionRefreshed(session)) {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
