import type { BlogPostInput } from "./manage";

export type ManageResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export function mapBlogErrorCode(message: string, status: number) {
  if (/already taken|unique/i.test(message)) return "SLUG_TAKEN";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  return message || "UNKNOWN_ERROR";
}

type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

export type ManagedBlogPost = {
  documentId: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  content?: string;
  date?: string;
  author?: string;
  readingTime?: number;
  targetLanguage?: string;
  publishedAt?: string | null;
  coverImage?: { id: number; url: string } | null;
};

const LIST_PAGE_SIZE = 100;

export function createBlogManageClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const publicBaseUrl = trimTrailingSlash(process.env.STRAPI_PUBLIC_URL ?? baseUrl);
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async list(accessToken: string): Promise<ManageResult<ManagedBlogPost[]>> {
      const params = new URLSearchParams({
        "pagination[pageSize]": String(LIST_PAGE_SIZE),
        sort: "date:desc",
        status: "draft",
        populate: "coverImage",
      });

      const response = await send(`/api/blog-posts?${params.toString()}`, { accessToken });
      if (!response.ok) return response;

      const body = response.data as { data?: unknown };
      const posts = Array.isArray(body.data) ? (body.data as ManagedBlogPost[]) : [];
      return { ok: true, data: posts.map((post) => ({ ...post, coverImage: resolveCoverImage(post.coverImage) })) };
    },

    async create(accessToken: string, payload: BlogPostInput): Promise<ManageResult<ManagedBlogPost>> {
      const response = await send("/api/blog-posts", { accessToken, method: "POST", payload });
      if (!response.ok) return response;
      return { ok: true, data: (response.data as { data: ManagedBlogPost }).data };
    },

    async update(accessToken: string, documentId: string, payload: BlogPostInput): Promise<ManageResult<ManagedBlogPost>> {
      const response = await send(`/api/blog-posts/${documentId}`, { accessToken, method: "PUT", payload });
      if (!response.ok) return response;
      return { ok: true, data: (response.data as { data: ManagedBlogPost }).data };
    },

    async remove(accessToken: string, documentId: string): Promise<ManageResult<null>> {
      const response = await send(`/api/blog-posts/${documentId}`, { accessToken, method: "DELETE" });
      if (!response.ok) return response;
      return { ok: true, data: null };
    },

    async uploadCoverImage(accessToken: string, file: File): Promise<ManageResult<{ id: number; url: string }>> {
      try {
        const form = new FormData();
        form.append("files", file);

        const response = await fetcher(`${baseUrl}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) {
          return { ok: false, error: await readErrorCode(response), status: response.status };
        }

        const uploaded = (await response.json().catch(() => null)) as Array<{ id: number; url: string }> | null;
        const media = uploaded?.[0];
        if (!media) return { ok: false, error: "UNKNOWN_ERROR", status: 502 };

        return { ok: true, data: { id: media.id, url: resolveMediaUrl(media.url, publicBaseUrl) } };
      } catch {
        return { ok: false, error: "UNKNOWN_ERROR", status: 502 };
      }
    },
  };

  function resolveCoverImage(coverImage: ManagedBlogPost["coverImage"]) {
    if (!coverImage) return coverImage ?? null;
    return { id: coverImage.id, url: resolveMediaUrl(coverImage.url, publicBaseUrl) };
  }

  async function send(
    path: string,
    init: { accessToken: string; method?: string; payload?: unknown }
  ): Promise<ManageResult<unknown>> {
    try {
      const response = await fetcher(`${baseUrl}${path}`, {
        method: init.method ?? "GET",
        headers: {
          Authorization: `Bearer ${init.accessToken}`,
          ...(init.payload ? { "Content-Type": "application/json" } : {}),
        },
        ...(init.payload ? { body: JSON.stringify({ data: init.payload }) } : {}),
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        return { ok: false, error: await readErrorCode(response), status: response.status };
      }

      if (response.status === 204) return { ok: true, data: null };
      return { ok: true, data: await response.json().catch(() => null) };
    } catch {
      return { ok: false, error: "UNKNOWN_ERROR", status: 502 };
    }
  }
}

async function readErrorCode(response: Response) {
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    const message = typeof body.error?.message === "string" ? body.error.message : "";
    return mapBlogErrorCode(message, response.status);
  } catch {
    return mapBlogErrorCode("", response.status);
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function resolveMediaUrl(url: string, baseUrl: string) {
  return /^https?:\/\//.test(url) ? url : `${baseUrl}${url}`;
}
