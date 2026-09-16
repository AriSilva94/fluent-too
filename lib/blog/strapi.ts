import { isMemberOf } from "@/lib/enums";
import { TARGET_LANGUAGE } from "@/lib/quizzes/types";
import type { BlogPost } from "./types";

type TargetLanguage = BlogPost["targetLanguage"];

type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

type BlogPostFilters = {
  targetLanguage?: TargetLanguage;
  slug?: string;
  fields?: string[];
};

const LIST_FIELDS = ["title", "slug", "category", "excerpt", "date", "author", "readingTime", "targetLanguage"];

type StrapiCollectionResponse = {
  data?: unknown[];
};

type StrapiMedia = {
  url?: unknown;
};

type StrapiBlogPostRecord = {
  id?: number | string;
  attributes?: unknown;
  title?: unknown;
  slug?: unknown;
  category?: unknown;
  excerpt?: unknown;
  content?: unknown;
  date?: unknown;
  author?: unknown;
  readingTime?: unknown;
  targetLanguage?: unknown;
  coverImage?: unknown;
};

export function createStrapiBlogClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async getBlogPosts(filters: BlogPostFilters = {}) {
      const params = createBaseParams();
      if (filters.targetLanguage) params.set("filters[targetLanguage][$eq]", filters.targetLanguage);
      if (filters.slug) params.set("filters[slug][$eq]", filters.slug);
      if (filters.fields?.length) filters.fields.forEach((field, index) => params.set(`fields[${index}]`, field));

      return fetchBlogPosts(`/api/blog-posts?${params.toString()}`);
    },
  };

  async function fetchBlogPosts(path: string) {
    try {
      const response = await fetcher(`${baseUrl}${path}`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) return [];

      const body = (await response.json()) as StrapiCollectionResponse;
      return Array.isArray(body.data) ? body.data.map(mapBlogPost).filter((post): post is BlogPost => Boolean(post)) : [];
    } catch {
      return [];
    }
  }
}

export async function getBlogPosts(targetLanguage?: TargetLanguage) {
  const posts = await createStrapiBlogClient().getBlogPosts({ targetLanguage, fields: LIST_FIELDS });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogPostBySlug(slug: string, targetLanguage?: TargetLanguage) {
  const posts = await createStrapiBlogClient().getBlogPosts({ slug, targetLanguage });
  return posts[0] ?? null;
}

function createBaseParams() {
  const params = new URLSearchParams();
  params.set("status", "published");
  params.set("populate", "coverImage");
  params.set("pagination[pageSize]", "100");
  return params;
}

function mapBlogPost(input: unknown): BlogPost | null {
  if (!input || typeof input !== "object") return null;

  const record = input as StrapiBlogPostRecord;
  const source = isObject(record.attributes) ? record.attributes : record;
  const slug = readString(source.slug);
  const title = readString(source.title);
  const category = readString(source.category);
  const excerpt = readString(source.excerpt);
  const content = readString(source.content);
  const date = readString(source.date);
  const author = readString(source.author);
  const readingTime = readNumber(source.readingTime);
  const targetLanguage = readTargetLanguage(source.targetLanguage);

  if (!slug || !title || !category || !excerpt || !date || !author || !targetLanguage) return null;

  const coverImage = readImageUrl(source.coverImage);

  return {
    slug,
    title,
    category,
    excerpt,
    date,
    author,
    readingTime: readingTime ?? 0,
    targetLanguage,
    ...(content ? { content } : {}),
    ...(coverImage ? { coverImage } : {}),
  };
}

function readImageUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const media = value as StrapiMedia;
  const url = readString(media.url);
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL || "";
  return base ? `${base.replace(/\/$/, "")}${url}` : url;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

function readTargetLanguage(value: unknown): TargetLanguage | null {
  return isMemberOf(TARGET_LANGUAGE, value) ? value : null;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isObject(value: unknown): value is StrapiBlogPostRecord {
  return Boolean(value) && typeof value === "object";
}
