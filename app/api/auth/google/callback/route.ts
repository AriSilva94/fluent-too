import { NextRequest, NextResponse } from "next/server";
import { handleGoogleCallback } from "@/lib/auth/oauth";
import { OAUTH_STATE_COOKIE, resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { getSiteUrl } from "@/lib/auth/request";
import { applyCookies } from "../../_shared";

export async function GET(request: NextRequest) {
  const result = await handleGoogleCallback(new URL(request.url), {
    client: createStrapiClient(),
    secureCookies: resolveAuthCookieSecure(request.url),
    expectedNonce: request.cookies.get(OAUTH_STATE_COOKIE)?.value,
  });
  const response = NextResponse.redirect(new URL(result.redirectTo, getSiteUrl(request)), { status: result.status });
  applyCookies(response, result.cookies);
  return response;
}
