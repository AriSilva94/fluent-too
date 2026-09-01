import type { QuizInput } from "./manage";

type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

export type ManagedQuiz = {
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  targetLanguage: string;
  level: string;
  type: string;
  isPublic: boolean;
  questions?: unknown[];
  publishedAt?: string | null;
  updatedAt?: string;
};

export type ManageResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export const MODERATION_ACTION = { publish: "publish", unpublish: "unpublish" } as const;

const LIST_PAGE_SIZE = 100;

export function createQuizManageClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async listOwn(accessToken: string): Promise<ManageResult<ManagedQuiz[]>> {
      const params = new URLSearchParams({
        "pagination[pageSize]": String(LIST_PAGE_SIZE),
        sort: "updatedAt:desc",
        status: "draft",
      });

      const response = await send(`/api/quizzes/mine?${params.toString()}`, { accessToken });
      if (!response.ok) return response;

      const body = response.data as { data?: unknown };
      return { ok: true, data: Array.isArray(body.data) ? (body.data as ManagedQuiz[]) : [] };
    },

    async listAll(accessToken: string, filters: { targetLanguage?: string } = {}): Promise<ManageResult<ManagedQuiz[]>> {
      const params = new URLSearchParams({
        "pagination[pageSize]": String(LIST_PAGE_SIZE),
        sort: "updatedAt:desc",
        status: "draft",
      });
      if (filters.targetLanguage) params.set("filters[targetLanguage][$eq]", filters.targetLanguage);

      const response = await send(`/api/quizzes?${params.toString()}`, { accessToken });
      if (!response.ok) return response;

      const body = response.data as { data?: unknown };
      return { ok: true, data: Array.isArray(body.data) ? (body.data as ManagedQuiz[]) : [] };
    },

    async setPublished(accessToken: string, documentId: string, published: boolean): Promise<ManageResult<null>> {
      const action = published ? MODERATION_ACTION.publish : MODERATION_ACTION.unpublish;
      const response = await send(`/api/quizzes/${documentId}/${action}`, { accessToken, method: "POST" });
      if (!response.ok) return response;
      return { ok: true, data: null };
    },

    async create(accessToken: string, payload: QuizInput): Promise<ManageResult<ManagedQuiz>> {
      const response = await send("/api/quizzes", { accessToken, method: "POST", payload });
      if (!response.ok) return response;
      return { ok: true, data: (response.data as { data: ManagedQuiz }).data };
    },

    async update(accessToken: string, documentId: string, payload: Partial<QuizInput>): Promise<ManageResult<ManagedQuiz>> {
      const response = await send(`/api/quizzes/${documentId}`, { accessToken, method: "PUT", payload });
      if (!response.ok) return response;
      return { ok: true, data: (response.data as { data: ManagedQuiz }).data };
    },

    async remove(accessToken: string, documentId: string): Promise<ManageResult<null>> {
      const response = await send(`/api/quizzes/${documentId}`, { accessToken, method: "DELETE" });
      if (!response.ok) return response;
      return { ok: true, data: null };
    },
  };

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

export function mapStrapiErrorCode(message: string, status: number) {
  if (/already taken|unique/i.test(message)) return "SLUG_TAKEN";
  if (status === 403) return "LANGUAGE_NOT_ALLOWED";
  if (status === 404) return "NOT_FOUND";
  return message || "UNKNOWN_ERROR";
}

async function readErrorCode(response: Response) {
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    const message = typeof body.error?.message === "string" ? body.error.message : "";
    return mapStrapiErrorCode(message, response.status);
  } catch {
    return mapStrapiErrorCode("", response.status);
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
