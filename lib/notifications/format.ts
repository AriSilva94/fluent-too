import { localeToHtmlLang, type Locale } from "@/lib/i18n";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function interpolate(template: string, data: Record<string, string | number | null>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = data[key];
    return value === null || value === undefined ? match : String(value);
  });
}

export function relativeTime(
  value: string,
  locale: Locale,
  options: { now?: Date; justNow?: string } = {}
) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "";

  const tag = localeToHtmlLang[locale];
  const elapsed = (options.now ?? new Date()).getTime() - parsed;

  if (elapsed >= WEEK || elapsed < -MINUTE) {
    return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short" }).format(new Date(parsed));
  }

  if (elapsed < MINUTE) return options.justNow ?? "";

  const formatter = new Intl.RelativeTimeFormat(tag, { numeric: "always", style: "narrow" });
  if (elapsed < HOUR) return formatter.format(-Math.floor(elapsed / MINUTE), "minute");
  if (elapsed < DAY) return formatter.format(-Math.floor(elapsed / HOUR), "hour");
  return formatter.format(-Math.floor(elapsed / DAY), "day");
}

export function badgeCount(value: number, max = 9) {
  if (value <= 0) return "";
  return value > max ? `${max}+` : String(value);
}
