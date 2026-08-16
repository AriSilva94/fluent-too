import type { AuthTokens } from "./contracts";

export const AUTH_COOKIE_NAMES = {
  access: "fluent_too_access",
  refresh: "fluent_too_refresh",
} as const;

export type AuthCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

export type CookieInstruction = {
  name: string;
  value: string;
  options: AuthCookieOptions;
};

export function buildAuthCookieOptions(maxAge: number, secure = process.env.AUTH_COOKIE_SECURE !== "false"): AuthCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  };
}

export function buildCookieInstructions(tokens: AuthTokens, secure = process.env.AUTH_COOKIE_SECURE !== "false") {
  return [
    { name: AUTH_COOKIE_NAMES.access, value: tokens.accessToken, options: buildAuthCookieOptions(600, secure) },
    { name: AUTH_COOKIE_NAMES.refresh, value: tokens.refreshToken, options: buildAuthCookieOptions(2592000, secure) },
  ];
}

export function buildClearCookieInstructions() {
  return [
    { name: AUTH_COOKIE_NAMES.access, value: "", options: buildAuthCookieOptions(0, false) },
    { name: AUTH_COOKIE_NAMES.refresh, value: "", options: buildAuthCookieOptions(0, false) },
  ];
}
