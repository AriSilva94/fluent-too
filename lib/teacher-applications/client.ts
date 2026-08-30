type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

type TeacherApplicationStatus = "pending" | "approved" | "rejected";

type ReviewResult = { ok: true } | { ok: false; error: string };

export type ListResult = { ok: true; data: unknown[] } | { ok: false; error: string };

export function createTeacherApplicationsClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  return {
    async list(accessToken: string, status?: TeacherApplicationStatus): Promise<ListResult> {
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        const query = params.toString();
        const path = query ? `/api/teacher-applications?${query}` : "/api/teacher-applications";

        const response = await fetcher(`${baseUrl}${path}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) return { ok: false, error: await readErrorMessage(response) };

        const body = (await response.json()) as { data?: unknown[] };
        return { ok: true, data: Array.isArray(body.data) ? body.data : [] };
      } catch {
        return { ok: false, error: "UNKNOWN_ERROR" };
      }
    },

    async approve(accessToken: string, id: number): Promise<ReviewResult> {
      try {
        const response = await fetcher(`${baseUrl}/api/teacher-applications/${id}/approve`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) return { ok: false, error: await readErrorMessage(response) };
        return { ok: true };
      } catch {
        return { ok: false, error: "UNKNOWN_ERROR" };
      }
    },

    async reject(accessToken: string, id: number, note: string): Promise<ReviewResult> {
      try {
        const response = await fetcher(`${baseUrl}/api/teacher-applications/${id}/reject`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewNote: note }),
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) return { ok: false, error: await readErrorMessage(response) };
        return { ok: true };
      } catch {
        return { ok: false, error: "UNKNOWN_ERROR" };
      }
    },
  };
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    return typeof body.error?.message === "string" ? body.error.message : "UNKNOWN_ERROR";
  } catch {
    return "UNKNOWN_ERROR";
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
