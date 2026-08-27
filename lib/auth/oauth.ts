import { buildCookieInstructions, type CookieInstruction } from "./cookies";
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

export function parseGoogleCallback(url: URL) {
  if (url.searchParams.get("error")) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };
  const accessToken = url.searchParams.get("access_token");
  if (!accessToken) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };
  return {
    ok: true as const,
    accessToken,
    returnTo: safeRedirect(url.searchParams.get("state"), "/pt-br/dashboard"),
  };
}

export async function handleGoogleCallback(
  url: URL,
  options: { client: GoogleClient; secureCookies?: boolean }
): Promise<{ status: number; redirectTo: string; cookies?: CookieInstruction[] }> {
  const parsed = parseGoogleCallback(url);
  if (!parsed.ok) return { status: 302, redirectTo: `/${localeFromState(url)}/login?error=${parsed.code}` };

  const response = await options.client.googleCallback(parsed.accessToken);
  if (!response.ok) {
    return { status: 302, redirectTo: `/${localeFromReturnTo(parsed.returnTo)}/login?error=${response.error}` };
  }

  return {
    status: 302,
    redirectTo: parsed.returnTo,
    cookies: buildCookieInstructions(response.data.tokens, options.secureCookies),
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
