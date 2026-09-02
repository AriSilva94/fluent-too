import { localeToHtmlLang, type Locale } from "@/lib/i18n";

export function reviewerName(reviewer: { username?: string | null; email?: string | null } | null | undefined) {
  const username = reviewer?.username?.trim();
  if (username) return username;

  const email = reviewer?.email?.trim();
  return email || null;
}

export function formatReviewDate(value: string | null | undefined, locale: Locale): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(localeToHtmlLang[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function buildDecisionLine({
  reviewer,
  reviewedAt,
  locale,
  byTemplate,
  unknownReviewer,
}: {
  reviewer: { username?: string | null; email?: string | null } | null | undefined;
  reviewedAt: string | null | undefined;
  locale: Locale;
  byTemplate: string;
  unknownReviewer: string;
}): string {
  const by = byTemplate.replace("{reviewer}", reviewerName(reviewer) ?? unknownReviewer);
  const date = formatReviewDate(reviewedAt, locale);

  return date ? `${by} · ${date}` : by;
}
