import { SESSION_STATUS } from "./session";

type SessionState = typeof SESSION_STATUS.anonymous | typeof SESSION_STATUS.authenticated;

export const NAVIGATION = { next: "next", redirect: "redirect" } as const;

export type AuthNavigationDecision =
  | { type: typeof NAVIGATION.next }
  | { type: typeof NAVIGATION.redirect; location: string };

const privatePaths = ["/dashboard", "/admin", "/teacher"];
const guestPaths = ["/login", "/register", "/forgot-password", "/auth/reset-password"];

export function decideAuthNavigation(pathname: string, session: SessionState): AuthNavigationDecision {
  const { locale, rest } = splitLocalizedPath(pathname);

  if (matchesPath(privatePaths, rest) && session === SESSION_STATUS.anonymous) {
    return {
      type: NAVIGATION.redirect,
      location: `/${locale}/login?returnTo=${encodeURIComponent(pathname)}`,
    };
  }
  if (matchesPath(guestPaths, rest) && session === SESSION_STATUS.authenticated) {
    return { type: NAVIGATION.redirect, location: `/${locale}/dashboard` };
  }
  return { type: NAVIGATION.next };
}

function matchesPath(paths: string[], rest: string) {
  return paths.some((path) => rest === path || rest.startsWith(`${path}/`));
}

function splitLocalizedPath(pathname: string) {
  const [, locale = "pt-br", ...segments] = pathname.split("/");
  return { locale, rest: `/${segments.join("/")}`.replace(/\/$/, "") || "/" };
}
