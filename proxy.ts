import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isValidLocale, localeToLangTag } from "@/lib/i18n";

const LOCALE_COOKIE = "NEXT_LOCALE";

function getPreferredLocale(request: NextRequest): string {
  // 1. Check cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
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
        if (code === langTag || code.startsWith(langTag + "-")) {
          return locale;
        }
      }
    }
  }

  // 3. Fallback to default
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return;
  }

  // Check if the pathname already has a locale
  const segments = pathname.split("/");
  const firstSegment = segments[1]; // e.g. "pt-br"

  if (isValidLocale(firstSegment)) {
    // Locale already in URL — set cookie to persist choice
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
    return response;
  }

  // No locale in URL — redirect to the preferred locale
  const locale = getPreferredLocale(request);
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${locale}${pathname}`;

  const response = NextResponse.redirect(newUrl);
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
