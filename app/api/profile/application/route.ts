import { NextResponse } from "next/server";
import { applyCookies, readTokenCookies } from "@/app/api/auth/_shared";
import { buildCookieInstructions, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createProfileClient } from "@/lib/profile/client";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const tokens = readTokenCookies(request);
  const session = await resolveSession(tokens, createStrapiClient());
  if (session.status === "anonymous") return NextResponse.json({ ok: false, data: null }, { status: 401 });

  const accessToken = session.status === "refreshed" ? session.tokens.accessToken : tokens.accessToken;
  if (!accessToken) return NextResponse.json({ ok: false, data: null }, { status: 401 });

  const result = await createProfileClient().myApplication(accessToken);
  const response = result.ok
    ? NextResponse.json({ ok: true, data: result.data })
    : NextResponse.json({ ok: false, error: result.error }, { status: result.status ?? 502 });

  if (session.status === "refreshed") {
    applyCookies(response, buildCookieInstructions(session.tokens, resolveAuthCookieSecure(request.url)));
  }
  return response;
}
