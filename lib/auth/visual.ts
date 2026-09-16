import { legalHref } from "@/lib/legal/documents";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export type AuthVisual = {
  headline: string;
  text: string;
  points: string[];
  legal: {
    termsHref: string;
    termsLabel: string;
    privacyHref: string;
    privacyLabel: string;
    copyright: string;
  };
};

export function buildAuthVisual(dict: Dictionary, locale: Locale): AuthVisual {
  return {
    headline: dict.auth.visualHeadline,
    text: dict.auth.visualText,
    points: [dict.auth.visualPoint1, dict.auth.visualPoint2, dict.auth.visualPoint3],
    legal: {
      termsHref: legalHref(locale, "terms"),
      termsLabel: dict.legal.termsShort,
      privacyHref: legalHref(locale, "privacy"),
      privacyLabel: dict.legal.privacyShort,
      copyright: dict.footer.copyright.replace("{year}", new Date().getFullYear().toString()),
    },
  };
}
