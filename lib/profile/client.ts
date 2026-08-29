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

/**
 * `status` só existe quando a falha veio de uma resposta HTTP real: a rota proxy
 * precisa dela para responder com o código correto (403, 400...); numa falha de
 * rede não há resposta, então não há status para repassar.
 */
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

    // Repassa o `FormData` recebido sem tocar em `Content-Type`: o fetch precisa
    // gerar sozinho o boundary do multipart.
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

async function readErrorCode(response: Response): Promise<AuthErrorCode> {
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    const message = body.error?.message;
    return typeof message === "string" ? (message as AuthErrorCode) : "UNKNOWN_ERROR";
  } catch {
    return "UNKNOWN_ERROR";
  }
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
