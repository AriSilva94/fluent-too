import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { buildGoogleStartUrl } from "@/lib/auth/oauth";
import { getSiteUrl } from "@/lib/auth/request";
import { safeRedirect } from "@/lib/auth/redirect";
import { buildOAuthStateCookie, resolveAuthCookieSecure } from "@/lib/auth/cookies";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteUrl = getSiteUrl(request);
  const callbackUrl = `${siteUrl}/api/auth/google/callback`;
  const returnTo = safeRedirect(url.searchParams.get("returnTo"), "/pt-br/dashboard");
  const strapiPublicUrl = process.env.STRAPI_PUBLIC_URL ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337";
  const nonce = randomBytes(16).toString("hex");

  const response = NextResponse.redirect(buildGoogleStartUrl(strapiPublicUrl, callbackUrl, returnTo, nonce));
  const cookie = buildOAuthStateCookie(nonce, resolveAuthCookieSecure(request.url));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
