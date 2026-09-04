import type { AuthTokens } from "./contracts";

export const AUTH_COOKIE_NAMES = {
  access: "fluent_too_access",
  refresh: "fluent_too_refresh",
} as const;

export const OAUTH_STATE_COOKIE = "fluent_too_oauth_nonce";

export type AuthCookieOptions = {
  httpOnly: true;
  sameSite: "lax" | "strict";
  secure: boolean;
  path: "/";
  maxAge: number;
};

export type CookieInstruction = {
  name: string;
  value: string;
  options: AuthCookieOptions;
};

export function buildAuthCookieOptions(maxAge: number, secure = process.env.AUTH_COOKIE_SECURE !== "false", sameSite: "lax" | "strict" = "lax"): AuthCookieOptions {
  return {
    httpOnly: true,
    sameSite,
    secure,
    path: "/",
    maxAge,
  };
}

export function buildCookieInstructions(tokens: AuthTokens, secure = process.env.AUTH_COOKIE_SECURE !== "false") {
  return [
    { name: AUTH_COOKIE_NAMES.access, value: tokens.accessToken, options: buildAuthCookieOptions(600, secure, "lax") },
    { name: AUTH_COOKIE_NAMES.refresh, value: tokens.refreshToken, options: buildAuthCookieOptions(2592000, secure, "lax") },
  ];
}

export function resolveAuthCookieSecure(url?: string | URL) {
  if (process.env.AUTH_COOKIE_SECURE) return process.env.AUTH_COOKIE_SECURE !== "false";
  if (!url) return process.env.NODE_ENV === "production";
  const parsed = typeof url === "string" ? new URL(url) : url;
  return parsed.protocol === "https:";
}

export function buildClearCookieInstructions() {
  return [
    { name: AUTH_COOKIE_NAMES.access, value: "", options: buildAuthCookieOptions(0, false, "lax") },
    { name: AUTH_COOKIE_NAMES.refresh, value: "", options: buildAuthCookieOptions(0, false, "lax") },
  ];
}

export function buildOAuthStateCookie(nonce: string, secure = process.env.AUTH_COOKIE_SECURE !== "false"): CookieInstruction {
  return { name: OAUTH_STATE_COOKIE, value: nonce, options: buildAuthCookieOptions(600, secure, "lax") };
}

export function buildClearOAuthStateCookie(): CookieInstruction {
  return { name: OAUTH_STATE_COOKIE, value: "", options: buildAuthCookieOptions(0, false, "lax") };
}
