import type { Locale } from "@/lib/i18n";

export function buildHomeAnchorHref(locale: Locale, hash: string) {
  if (hash === "#inicio") return `/${locale}/`;
  return `/${locale}/${hash}`;
}

export function shouldHandleHomeAnchorScroll(pathname: string, locale: Locale) {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}
