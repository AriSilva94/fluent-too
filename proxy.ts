import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isValidLocale, localeToLangTag } from "@/lib/i18n";
import { AUTH_COOKIE_NAMES, buildClearCookieInstructions, buildCookieInstructions } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";
import { decideAuthNavigation } from "@/lib/auth/proxy";

const LOCALE_COOKIE = "NEXT_LOCALE";

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, q] = lang.trim().split(";q=");
        return { code: code.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { code } of languages) {
      for (const locale of locales) {
        const langTag = localeToLangTag[locale];
        if (code === langTag || code.startsWith(`${langTag}-`)) return locale;
      }
    }
  }

  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) return;

  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (!isValidLocale(firstSegment)) {
    const locale = getPreferredLocale(request);
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(newUrl);
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  }

  const session = await resolveSession(
    {
      accessToken: request.cookies.get(AUTH_COOKIE_NAMES.access)?.value,
      refreshToken: request.cookies.get(AUTH_COOKIE_NAMES.refresh)?.value,
    },
    createStrapiClient()
  );
  const decision = decideAuthNavigation(
    pathname,
    session.status === "anonymous" ? "anonymous" : "authenticated",
    process.env.STRAPI_PUBLIC_URL ?? "http://localhost:1337"
  );

  const response =
    decision.type === "redirect" ? NextResponse.redirect(new URL(decision.location, request.url)) : NextResponse.next();

  response.cookies.set(LOCALE_COOKIE, firstSegment, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  response.headers.set("x-locale", firstSegment);

  if (session.status === "refreshed") {
    for (const cookie of buildCookieInstructions(session.tokens, process.env.AUTH_COOKIE_SECURE !== "false")) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
  }

  if (session.status === "anonymous" && session.clear) {
    for (const cookie of buildClearCookieInstructions()) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
