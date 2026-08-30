import type { AuthErrorCode } from "@/lib/auth/contracts";

type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

export type TeacherApplicationStatus = "pending" | "approved" | "rejected";

export type ProfileApplication = {
  status: TeacherApplicationStatus;
  reviewNote: string | null;
  createdAt: string;
};

export type ActionResult = { ok: true } | { ok: false; error: AuthErrorCode; status?: number };

export type ApplicationResult =
  | { ok: true; data: ProfileApplication | null }
  | { ok: false; error: AuthErrorCode; status?: number };

export function createProfileClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  async function post(path: string, accessToken: string, body?: FormData): Promise<ActionResult> {
    try {
      const response = await fetcher(`${baseUrl}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        ...(body ? { body } : {}),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) return { ok: false, error: await readErrorCode(response), status: response.status };
      return { ok: true };
    } catch {
      return { ok: false, error: "UNKNOWN_ERROR" };
    }
  }

  return {
    becomeStudent(accessToken: string): Promise<ActionResult> {
      return post("/api/profile/student", accessToken);
    },

    becomeTeacher(accessToken: string, formData: FormData): Promise<ActionResult> {
      return post("/api/profile/teacher", accessToken, formData);
    },

    async myApplication(accessToken: string): Promise<ApplicationResult> {
      try {
        const response = await fetcher(`${baseUrl}/api/profile/application`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) return { ok: false, error: await readErrorCode(response), status: response.status };

        const body = (await response.json()) as { data: ProfileApplication | null };
        return { ok: true, data: body.data ?? null };
      } catch {
        return { ok: false, error: "UNKNOWN_ERROR" };
      }
    },
  };
}

const KNOWN_ERROR_CODES: readonly AuthErrorCode[] = [
  "PROFILE_ALREADY_SET",
  "TEACHER_APPLICATION_EXISTS",
  "FILE_TOO_LARGE",
  "INVALID_FILE_TYPE",
  "REQUIRED",
  "UNAUTHORIZED",
  "ROLE_UNAVAILABLE",
  "INVALID_URL",
];

function isKnownErrorCode(value: string): value is AuthErrorCode {
  return (KNOWN_ERROR_CODES as readonly string[]).includes(value);
}

async function readErrorCode(response: Response): Promise<AuthErrorCode> {
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    const message = body.error?.message;
    return typeof message === "string" && isKnownErrorCode(message) ? message : "UNKNOWN_ERROR";
  } catch {
    return "UNKNOWN_ERROR";
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
