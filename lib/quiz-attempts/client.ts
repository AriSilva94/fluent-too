import type { QuizAttempt, QuizAttemptPayload } from "./types";

type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

export function createQuizAttemptsClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async create(accessToken: string, payload: QuizAttemptPayload) {
      const response = await fetcher(`${baseUrl}/api/quiz-attempts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: payload }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      return { ok: response.ok };
    },
    async list(accessToken: string): Promise<{ ok: true; data: QuizAttempt[] } | { ok: false; data: [] }> {
      const response = await fetcher(`${baseUrl}/api/quiz-attempts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) return { ok: false, data: [] };
      const body = (await response.json()) as { data?: QuizAttempt[] };
      return { ok: true, data: Array.isArray(body.data) ? body.data : [] };
    },
  };
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
