import { NextResponse } from "next/server";
import { handleGoogleCallback } from "@/lib/auth/oauth";
import { resolveAuthCookieSecure } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { applyCookies } from "../../_shared";

export async function GET(request: Request) {
  const result = await handleGoogleCallback(new URL(request.url), {
    client: createStrapiClient(),
    secureCookies: resolveAuthCookieSecure(request.url),
  });
  const response = NextResponse.redirect(new URL(result.redirectTo, request.url), { status: result.status });
  applyCookies(response, result.cookies);
  return response;
}
