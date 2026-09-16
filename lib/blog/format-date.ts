import { localeToHtmlLang, type Locale } from "@/lib/i18n";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseIsoDate(value: string): Date | null {
  const match = value.trim().match(ISO_DATE);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBlogDate(value: string, locale: Locale): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat(localeToHtmlLang[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
