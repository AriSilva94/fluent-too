type SessionState = "anonymous" | "authenticated";

export type AuthNavigationDecision =
  | { type: "next" }
  | { type: "redirect"; location: string };

const privatePaths = ["/dashboard"];
const guestPaths = ["/login", "/register", "/forgot-password", "/auth/reset-password"];

export function decideAuthNavigation(
  pathname: string,
  session: SessionState,
  strapiPublicUrl: string
): AuthNavigationDecision {
  const { locale, rest } = splitLocalizedPath(pathname);

  if (rest === "/admin") return { type: "redirect", location: `${trimTrailingSlash(strapiPublicUrl)}/admin` };
  if (privatePaths.some((path) => rest === path || rest.startsWith(`${path}/`)) && session === "anonymous") {
    return {
      type: "redirect",
      location: `/${locale}/login?returnTo=${encodeURIComponent(pathname)}`,
    };
  }
  if (guestPaths.some((path) => rest === path || rest.startsWith(`${path}/`)) && session === "authenticated") {
    return { type: "redirect", location: `/${locale}/dashboard` };
  }
  return { type: "next" };
}

function splitLocalizedPath(pathname: string) {
  const [, locale = "pt-br", ...segments] = pathname.split("/");
  return { locale, rest: `/${segments.join("/")}`.replace(/\/$/, "") || "/" };
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
