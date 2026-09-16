import { timingSafeEqual } from "node:crypto";
import { buildCookieInstructions, buildClearOAuthStateCookie, type CookieInstruction } from "./cookies";
import { safeRedirect } from "./redirect";
import { defaultLocale, isValidLocale } from "@/lib/i18n";
import type { AuthResponse, AuthSuccess } from "./contracts";

type GoogleClient = {
  googleCallback(accessToken: string): Promise<AuthResponse<AuthSuccess>>;
};

export function buildGoogleStartUrl(strapiPublicUrl: string, callbackUrl: string, returnTo: string) {
  const url = new URL("/api/connect/google", trimTrailingSlash(strapiPublicUrl));
  url.searchParams.set("callback", callbackUrl);
  url.searchParams.set("state", safeRedirect(returnTo, "/pt-br/dashboard"));
  return url.toString();
}

export type OAuthNonce = { expected?: string; received?: string };

export function buildGoogleCallbackUrl(siteUrl: string, nonce: string) {
  return `${trimTrailingSlash(siteUrl)}/api/auth/google/callback/${encodeURIComponent(nonce)}`;
}

export function nonceMatches({ expected, received }: OAuthNonce) {
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseGoogleCallback(url: URL, nonce: OAuthNonce) {
  if (url.searchParams.get("error")) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };
  const accessToken = url.searchParams.get("access_token");
  if (!accessToken) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };
  if (!nonceMatches(nonce)) return { ok: false as const, code: "OAUTH_STATE_MISMATCH" as const };

  return {
    ok: true as const,
    accessToken,
    returnTo: safeRedirect(url.searchParams.get("state"), "/pt-br/dashboard"),
  };
}

export async function handleGoogleCallback(
  url: URL,
  options: { client: GoogleClient; secureCookies?: boolean; nonce: OAuthNonce }
): Promise<{ status: number; redirectTo: string; cookies?: CookieInstruction[] }> {
  const parsed = parseGoogleCallback(url, options.nonce);
  const clearNonceCookie = buildClearOAuthStateCookie();

  if (!parsed.ok) {
    return {
      status: 302,
      redirectTo: `/${localeFromState(url)}/login?error=${parsed.code}`,
      cookies: [clearNonceCookie],
    };
  }

  const response = await options.client.googleCallback(parsed.accessToken);
  if (!response.ok) {
    return {
      status: 302,
      redirectTo: `/${localeFromReturnTo(parsed.returnTo)}/login?error=${response.error}`,
      cookies: [clearNonceCookie],
    };
  }

  return {
    status: 302,
    redirectTo: parsed.returnTo,
    cookies: [...buildCookieInstructions(response.data.tokens, options.secureCookies), clearNonceCookie],
  };
}

function localeFromState(url: URL) {
  return localeFromReturnTo(safeRedirect(url.searchParams.get("state"), `/${defaultLocale}/dashboard`));
}

function localeFromReturnTo(returnTo: string) {
  const segment = returnTo.split("/")[1] ?? "";
  return isValidLocale(segment) ? segment : defaultLocale;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
