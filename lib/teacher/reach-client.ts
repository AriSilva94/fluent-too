type Fetcher = typeof fetch;

export type TeacherReach = {
  attempts: number;
  learners: number;
  averageScore: number;
  topQuiz: { slug: string; title: string; attempts: number } | null;
};

export const EMPTY_REACH: TeacherReach = { attempts: 0, learners: 0, averageScore: 0, topQuiz: null };

export function createTeacherReachClient(options: { baseUrl?: string; fetcher?: Fetcher; timeoutMs?: number } = {}) {
  const baseUrl = (options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337").replace(/\/+$/, "");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async get(accessToken: string): Promise<TeacherReach> {
      try {
        const response = await fetcher(`${baseUrl}/api/quizzes/mine/reach`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) return EMPTY_REACH;
        const body = (await response.json()) as { data?: Partial<TeacherReach> };
        return {
          attempts: numberOr(body.data?.attempts),
          learners: numberOr(body.data?.learners),
          averageScore: numberOr(body.data?.averageScore),
          topQuiz: body.data?.topQuiz ?? null,
        };
      } catch {
        return EMPTY_REACH;
      }
    },
  };
}

function numberOr(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
