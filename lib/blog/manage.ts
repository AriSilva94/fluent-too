import { slugify, TARGET_LANGUAGES, type TargetLanguage } from "@/lib/quizzes/manage";

export type BlogPostInput = {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  targetLanguage: TargetLanguage;
  readingTime?: number;
};

export type BlogPostInputError =
  | "TITLE_REQUIRED"
  | "INVALID_SLUG"
  | "CATEGORY_REQUIRED"
  | "EXCERPT_REQUIRED"
  | "CONTENT_REQUIRED"
  | "AUTHOR_REQUIRED"
  | "INVALID_DATE"
  | "INVALID_LANGUAGE";

export type BlogPostInputResult = { ok: true; data: BlogPostInput } | { ok: false; error: BlogPostInputError };

const MAX_TITLE_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 500;

export function validateBlogPostInput(input: unknown): BlogPostInputResult {
  const value = (input ?? {}) as Record<string, unknown>;

  const title = readText(value.title).slice(0, MAX_TITLE_LENGTH);
  if (!title) return { ok: false, error: "TITLE_REQUIRED" };

  const slug = readText(value.slug) ? slugify(readText(value.slug)) : slugify(title);
  if (!slug) return { ok: false, error: "INVALID_SLUG" };

  const category = readText(value.category);
  if (!category) return { ok: false, error: "CATEGORY_REQUIRED" };

  const excerpt = readText(value.excerpt).slice(0, MAX_EXCERPT_LENGTH);
  if (!excerpt) return { ok: false, error: "EXCERPT_REQUIRED" };

  const content = readText(value.content);
  if (!content) return { ok: false, error: "CONTENT_REQUIRED" };

  const author = readText(value.author);
  if (!author) return { ok: false, error: "AUTHOR_REQUIRED" };

  const date = readText(value.date);
  if (!isIsoDate(date)) return { ok: false, error: "INVALID_DATE" };

  const targetLanguage = value.targetLanguage;
  if (!isTargetLanguage(targetLanguage)) return { ok: false, error: "INVALID_LANGUAGE" };

  const readingTime = readPositiveInteger(value.readingTime);

  return {
    ok: true,
    data: {
      title,
      slug,
      category,
      excerpt,
      content,
      date,
      author,
      targetLanguage,
      ...(readingTime ? { readingTime } : {}),
    },
  };
}

export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isTargetLanguage(value: unknown): value is TargetLanguage {
  return TARGET_LANGUAGES.includes(value as TargetLanguage);
}

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
