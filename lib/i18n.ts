export const locales = ["pt-br", "en-us", "fr-fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-br";

export const localeLabels: Record<Locale, string> = {
  "pt-br": "PT-BR",
  "en-us": "EN",
  "fr-fr": "FR",
};

/** Maps URL slug → Accept-Language prefix for matching */
export const localeToLangTag: Record<Locale, string> = {
  "pt-br": "pt",
  "en-us": "en",
  "fr-fr": "fr",
};

export const localeToHtmlLang: Record<Locale, string> = {
  "pt-br": "pt-BR",
  "en-us": "en-US",
  "fr-fr": "fr-FR",
};

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
