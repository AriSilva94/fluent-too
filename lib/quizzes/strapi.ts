import type { Locale } from "@/lib/i18n";
import type { Quiz, QuizLevel } from "./types";

type TargetLanguage = Quiz["targetLanguage"];

type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

type QuizFilters = {
  targetLanguage?: TargetLanguage;
  level?: QuizLevel;
  levels?: QuizLevel[];
  // Strapi `fields`: restringe os atributos escalares devolvidos. Usado nas listagens
  // pra não trazer `questions` (só necessário na página que aplica o quiz), que pode
  // ser um payload grande por registro.
  fields?: string[];
};

const LIST_FIELDS = ["title", "slug", "description", "level", "type", "targetLanguage"];

type StrapiCollectionResponse = {
  data?: unknown[];
};

type StrapiMedia = {
  url?: unknown;
};

type StrapiQuizRecord = {
  id?: number | string;
  attributes?: unknown;
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  level?: unknown;
  type?: unknown;
  targetLanguage?: unknown;
  questions?: unknown;
  image?: unknown;
};

export function createStrapiQuizClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async getQuizzes(filters: QuizFilters = {}) {
      const params = createBaseParams();
      if (filters.targetLanguage) params.set("filters[targetLanguage][$eq]", filters.targetLanguage);
      if (filters.level) params.set("filters[level][$eq]", filters.level);
      // Uma única chamada com `$in` troca N requisições (uma por nível) por uma só,
      // deixando o agrupamento por nível para quem chama.
      if (filters.levels?.length) {
        filters.levels.forEach((level, index) => params.set(`filters[level][$in][${index}]`, level));
      }
      if (filters.fields?.length) {
        filters.fields.forEach((field, index) => params.set(`fields[${index}]`, field));
      }

      return fetchQuizzes(`/api/quizzes?${params.toString()}`);
    },
    async getQuizBySlug(slug: string, targetLanguage?: TargetLanguage) {
      const params = createBaseParams();
      params.set("filters[slug][$eq]", slug);
      if (targetLanguage) params.set("filters[targetLanguage][$eq]", targetLanguage);

      const quizzes = await fetchQuizzes(`/api/quizzes?${params.toString()}`);
      return quizzes[0] ?? null;
    },
  };

  async function fetchQuizzes(path: string) {
    try {
      const response = await fetcher(`${baseUrl}${path}`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) return [];

      const body = (await response.json()) as StrapiCollectionResponse;
      return Array.isArray(body.data) ? body.data.map(mapQuiz).filter((quiz): quiz is Quiz => Boolean(quiz)) : [];
    } catch {
      return [];
    }
  }
}

export async function getQuizzes(locale?: Locale) {
  const targetLanguage = locale ? getTargetLanguageByLocale(locale) : undefined;
  return createStrapiQuizClient().getQuizzes({ targetLanguage, fields: LIST_FIELDS });
}

export async function getQuizById(id: string, locale?: Locale) {
  const targetLanguage = locale ? getTargetLanguageByLocale(locale) : undefined;
  return createStrapiQuizClient().getQuizBySlug(id, targetLanguage);
}

export async function getQuizzesByLevel(level: QuizLevel, locale?: Locale) {
  const targetLanguage = locale ? getTargetLanguageByLocale(locale) : undefined;
  return createStrapiQuizClient().getQuizzes({ targetLanguage, level, fields: LIST_FIELDS });
}

export async function getQuizzesByLevels(levels: QuizLevel[], locale?: Locale) {
  const targetLanguage = locale ? getTargetLanguageByLocale(locale) : undefined;
  return createStrapiQuizClient().getQuizzes({ targetLanguage, levels, fields: LIST_FIELDS });
}

/**
 * Busca todos os níveis pedidos numa única requisição ao Strapi e devolve já
 * agrupado por nível — usado pela Home para não fazer uma chamada por grupo
 * (A1, A2, B1, B2, C1, C2 viravam 7 requisições; aqui é 1).
 */
export async function getQuizzesGroupedByLevels(levelGroups: QuizLevel[][], locale?: Locale) {
  const allLevels = Array.from(new Set(levelGroups.flat()));
  const quizzes = await getQuizzesByLevels(allLevels, locale);

  return levelGroups.map((levels) => quizzes.filter((quiz) => levels.includes(quiz.level)));
}

function createBaseParams() {
  const params = new URLSearchParams();
  params.set("status", "published");
  params.set("sort", "title:asc");
  params.set("pagination[pageSize]", "100");
  return params;
}

function mapQuiz(input: unknown): Quiz | null {
  if (!input || typeof input !== "object") return null;

  const record = input as StrapiQuizRecord;
  const source = isObject(record.attributes) ? record.attributes : record;
  const slug = readString(source.slug);
  const title = readString(source.title);
  const description = readString(source.description);
  const level = readLevel(source.level);
  const type = readType(source.type);
  const targetLanguage = readTargetLanguage(source.targetLanguage);
  // Nas listagens (`fields` sem `questions`), o Strapi nem devolve a chave: fica `[]`.
  // Só a página de detalhe (`getQuizById`), que pede o registro completo, tem as perguntas de verdade.
  const questions = Array.isArray(source.questions) ? source.questions : [];

  if (!slug || !title || !description || !level || !type || !targetLanguage) return null;

  const image = readImageUrl(source.image);

  return {
    id: slug,
    title,
    description,
    level,
    type,
    targetLanguage,
    questions,
    ...(image ? { image } : {}),
  } as Quiz;
}

function readImageUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const media = value as StrapiMedia;
  const url = readString(media.url);
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL || process.env.STRAPI_PUBLIC_URL || "";
  return base ? `${base.replace(/\/$/, "")}${url}` : url;
}

function getTargetLanguageByLocale(locale: Locale): TargetLanguage {
  switch (locale) {
    case "pt-br":
      return "pt";
    case "en-us":
      return "en";
    case "fr-fr":
      return "fr";
  }
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function readLevel(value: unknown): QuizLevel | null {
  return value === "A1" || value === "A2" || value === "B1" || value === "B2" || value === "C1" || value === "C2"
    ? value
    : null;
}

function readType(value: unknown): Quiz["type"] | null {
  return value === "multiple-choice" || value === "fill-gap" || value === "flashcard" ? value : null;
}

function readTargetLanguage(value: unknown): TargetLanguage | null {
  return value === "pt" || value === "en" || value === "fr" ? value : null;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isObject(value: unknown): value is StrapiQuizRecord {
  return Boolean(value) && typeof value === "object";
}
