import { buildCookieInstructions, buildClearOAuthStateCookie, type CookieInstruction } from "./cookies";
import { safeRedirect } from "./redirect";
import { defaultLocale, isValidLocale } from "@/lib/i18n";
import type { AuthResponse, AuthSuccess } from "./contracts";

type GoogleClient = {
  googleCallback(accessToken: string): Promise<AuthResponse<AuthSuccess>>;
};

export function buildGoogleStartUrl(strapiPublicUrl: string, callbackUrl: string, returnTo: string, nonce: string) {
  const url = new URL("/api/connect/google", trimTrailingSlash(strapiPublicUrl));
  url.searchParams.set("callback", callbackUrl);
  url.searchParams.set("state", encodeState(nonce, safeRedirect(returnTo, "/pt-br/dashboard")));
  return url.toString();
}

export function parseGoogleCallback(url: URL, expectedNonce?: string | null) {
  if (url.searchParams.get("error")) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };
  const accessToken = url.searchParams.get("access_token");
  if (!accessToken) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };

  const state = decodeState(url.searchParams.get("state"));
  // Sem nonce esperado (cookie ausente/expirado) ou nonce que não bate: alguém pode
  // ter iniciado o fluxo com a própria conta e enviado este callback para a vítima.
  if (!expectedNonce || !state || state.nonce !== expectedNonce) {
    return { ok: false as const, code: "OAUTH_STATE_MISMATCH" as const };
  }

  return {
    ok: true as const,
    accessToken,
    returnTo: state.returnTo,
  };
}

export async function handleGoogleCallback(
  url: URL,
  options: { client: GoogleClient; secureCookies?: boolean; expectedNonce?: string | null }
): Promise<{ status: number; redirectTo: string; cookies?: CookieInstruction[] }> {
  const parsed = parseGoogleCallback(url, options.expectedNonce);
  // O nonce é de uso único: some da resposta esteja o callback ok ou não.
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

function encodeState(nonce: string, returnTo: string) {
  return Buffer.from(JSON.stringify({ n: nonce, r: returnTo }), "utf8").toString("base64url");
}

function decodeState(state: string | null): { nonce: string; returnTo: string } | null {
  if (!state) return null;
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as { n?: unknown; r?: unknown };
    if (typeof parsed.n !== "string" || typeof parsed.r !== "string") return null;
    return { nonce: parsed.n, returnTo: safeRedirect(parsed.r, "/pt-br/dashboard") };
  } catch {
    return null;
  }
}

function localeFromState(url: URL) {
  const state = decodeState(url.searchParams.get("state"));
  return localeFromReturnTo(state?.returnTo ?? `/${defaultLocale}/dashboard`);
}

function localeFromReturnTo(returnTo: string) {
  const segment = returnTo.split("/")[1] ?? "";
  return isValidLocale(segment) ? segment : defaultLocale;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
