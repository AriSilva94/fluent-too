import { isMemberOf, valuesOf } from "@/lib/enums";
import { QUIZ_LEVEL, QUIZ_TYPE, TARGET_LANGUAGE, type QuizLevel, type QuizType, type TargetLanguage } from "./types";

export const QUIZ_TYPES: QuizType[] = valuesOf(QUIZ_TYPE);
export const QUIZ_LEVELS: QuizLevel[] = valuesOf(QUIZ_LEVEL);
export const TARGET_LANGUAGES: TargetLanguage[] = valuesOf(TARGET_LANGUAGE);

export type { TargetLanguage };

export type QuizInput = {
  title: string;
  slug: string;
  description?: string;
  targetLanguage: TargetLanguage;
  level: QuizLevel;
  type: QuizType;
  questions: unknown[];
  estimatedMinutes?: number;
  isPublic: boolean;
};

export type QuizInputError =
  | "TITLE_REQUIRED"
  | "TITLE_TOO_LONG"
  | "INVALID_SLUG"
  | "INVALID_LANGUAGE"
  | "INVALID_LEVEL"
  | "INVALID_QUIZ_TYPE"
  | "QUESTIONS_REQUIRED"
  | "TOO_MANY_QUESTIONS"
  | "LANGUAGE_NOT_ALLOWED";

export type QuizInputResult = { ok: true; data: QuizInput } | { ok: false; error: QuizInputError };

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_QUESTIONS = 50;

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validateQuizInput(input: unknown): QuizInputResult {
  const value = (input ?? {}) as Record<string, unknown>;

  const title = readText(value.title);
  if (!title) return { ok: false, error: "TITLE_REQUIRED" };
  if (title.length > MAX_TITLE_LENGTH) return { ok: false, error: "TITLE_TOO_LONG" };

  const slug = readText(value.slug) ? slugify(readText(value.slug)) : slugify(title);
  if (!slug) return { ok: false, error: "INVALID_SLUG" };

  const targetLanguage = value.targetLanguage;
  if (!isTargetLanguage(targetLanguage)) return { ok: false, error: "INVALID_LANGUAGE" };

  const level = value.level;
  if (!isQuizLevel(level)) return { ok: false, error: "INVALID_LEVEL" };

  const type = value.type;
  if (!isQuizType(type)) return { ok: false, error: "INVALID_QUIZ_TYPE" };

  const questions = Array.isArray(value.questions) ? value.questions : [];
  if (questions.length === 0) return { ok: false, error: "QUESTIONS_REQUIRED" };
  if (questions.length > MAX_QUESTIONS) return { ok: false, error: "TOO_MANY_QUESTIONS" };

  const description = readText(value.description).slice(0, MAX_DESCRIPTION_LENGTH);
  const estimatedMinutes = readPositiveInteger(value.estimatedMinutes);

  return {
    ok: true,
    data: {
      title,
      slug,
      targetLanguage,
      level,
      type,
      questions,
      isPublic: value.isPublic !== false,
      ...(description ? { description } : {}),
      ...(estimatedMinutes ? { estimatedMinutes } : {}),
    },
  };
}

export function isLanguageAllowed(teachingLanguages: unknown, targetLanguage: TargetLanguage, isAdmin: boolean) {
  if (isAdmin) return true;
  const allowed = Array.isArray(teachingLanguages) ? teachingLanguages : [];
  return allowed.includes(targetLanguage);
}

function isTargetLanguage(value: unknown): value is TargetLanguage {
  return isMemberOf(TARGET_LANGUAGE, value);
}

function isQuizLevel(value: unknown): value is QuizLevel {
  return isMemberOf(QUIZ_LEVEL, value);
}

function isQuizType(value: unknown): value is QuizType {
  return isMemberOf(QUIZ_TYPE, value);
}

function readText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}
