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

/**
 * O provider Google do Strapi (grant/purest por baixo) reconstrói a URL final do
 * callback só com os campos do token (`access_token`, `id_token`, `raw[...]`) — ele
 * NUNCA ecoa de volta o `state` que mandamos no início do fluxo (confirmado em
 * produção). Por isso o nonce não pode viver no `state`: a prova de que foi ESTE
 * navegador que iniciou o fluxo é só a presença do cookie de nonce, ainda válido
 * (10 min). Isso fecha o ataque do S1 — atacante inicia com a própria conta e manda
 * o link do callback pronto pra vítima: ela nunca teria o cookie certo, porque nunca
 * visitou `/api/auth/google` por conta própria.
 */
export function parseGoogleCallback(url: URL, hasNonceCookie: boolean) {
  if (url.searchParams.get("error")) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };
  const accessToken = url.searchParams.get("access_token");
  if (!accessToken) return { ok: false as const, code: "GOOGLE_AUTH_FAILED" as const };
  if (!hasNonceCookie) return { ok: false as const, code: "OAUTH_STATE_MISMATCH" as const };

  return {
    ok: true as const,
    accessToken,
    returnTo: safeRedirect(url.searchParams.get("state"), "/pt-br/dashboard"),
  };
}

export async function handleGoogleCallback(
  url: URL,
  options: { client: GoogleClient; secureCookies?: boolean; hasNonceCookie: boolean }
): Promise<{ status: number; redirectTo: string; cookies?: CookieInstruction[] }> {
  const parsed = parseGoogleCallback(url, options.hasNonceCookie);
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
