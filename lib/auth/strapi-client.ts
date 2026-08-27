import { mapStrapiError } from "./errors";
import type {
  AuthResponse,
  AuthSuccess,
  AuthTokens,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegistrationSuccess,
  RegisterPayload,
  ResetPasswordPayload,
} from "./contracts";

type Fetcher = typeof fetch;

type ClientOptions = {
  baseUrl?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
};

type StrapiAuthBody = {
  jwt?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
};

export function createStrapiClient(options: ClientOptions = {}) {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? process.env.STRAPI_INTERNAL_URL ?? "http://localhost:1337");
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 10000;

  async function request<T>(path: string, init: RequestInit = {}): Promise<AuthResponse<T>> {
    const headers = normalizeHeaders(init.headers);
    if (init.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

    const response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      headers,
      signal: init.signal ?? AbortSignal.timeout(timeoutMs),
    });
    const body = await parseBody(response);

    if (!response.ok) {
      const message = readMessage(body);
      return { ok: false, error: mapStrapiError(response.status, message), status: response.status };
    }

    return { ok: true, data: body as T };
  }

  async function auth(path: string, body: unknown, method: "GET" | "POST" = "POST"): Promise<AuthResponse<AuthSuccess>> {
    const response = await request<StrapiAuthBody>(path, {
      method,
      ...(method === "GET" ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) return response;
    const tokens = extractTokens(response.data);
    if (!tokens || !response.data.user) return { ok: false, error: "UNKNOWN_ERROR", status: 502 };
    return { ok: true, data: { tokens, user: response.data.user } };
  }

  return {
    login(payload: LoginPayload) {
      return auth("/api/auth/local", { identifier: payload.email, password: payload.password });
    },
    register(payload: RegisterPayload) {
      return register(payload);
    },
    async me(accessToken: string): Promise<AuthResponse<AuthUser>> {
      return request<AuthUser>("/api/users/me", { headers: { Authorization: `Bearer ${accessToken}` } });
    },
    async refresh(refreshToken: string): Promise<AuthResponse<{ tokens: AuthTokens }>> {
      const response = await request<StrapiAuthBody>("/api/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return response;
      const tokens = extractTokens(response.data);
      if (!tokens) return { ok: false, error: "UNKNOWN_ERROR", status: 502 };
      return { ok: true, data: { tokens } };
    },
    logout(accessToken: string, refreshToken: string) {
      return request<{ ok: true }>("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ refreshToken }),
      });
    },
    forgotPassword(payload: ForgotPasswordPayload) {
      return request<{ ok: true }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) });
    },
    resetPassword(payload: ResetPasswordPayload) {
      return auth("/api/auth/reset-password", payload);
    },
    resendConfirmation(payload: ForgotPasswordPayload) {
      return request<{ ok: true }>("/api/auth/send-email-confirmation", { method: "POST", body: JSON.stringify(payload) });
    },
    changePassword(accessToken: string, payload: ChangePasswordPayload) {
      return auth("/api/auth/change-password", {
        currentPassword: payload.currentPassword,
        password: payload.password,
        passwordConfirmation: payload.passwordConfirmation,
      });
    },
    googleCallback(accessToken: string) {
      return auth(`/api/auth/google/callback?access_token=${encodeURIComponent(accessToken)}`, undefined, "GET");
    },
  };

  async function register(payload: RegisterPayload): Promise<AuthResponse<RegistrationSuccess>> {
    const response = await request<StrapiAuthBody>("/api/auth/local/register", {
      method: "POST",
      body: JSON.stringify({
        username: payload.email,
        email: payload.email,
        password: payload.password,
      }),
    });
    if (!response.ok) return response;
    if (!response.data.user) return { ok: false, error: "UNKNOWN_ERROR", status: 502 };
    const tokens = extractTokens(response.data);
    return { ok: true, data: { user: response.data.user, ...(tokens ? { tokens } : {}) } };
  }
}

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {};
  }
}

function readMessage(body: unknown) {
  if (!body || typeof body !== "object") return undefined;
  const value = body as { error?: { message?: unknown }; message?: unknown };
  return value.error?.message ?? value.message;
}

function extractTokens(body: StrapiAuthBody): AuthTokens | null {
  const accessToken = body.jwt ?? body.accessToken;
  if (!accessToken || !body.refreshToken) return null;
  return { accessToken, refreshToken: body.refreshToken };
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeHeaders(headers: HeadersInit | undefined) {
  const result: Record<string, string> = {};
  if (!headers) return result;
  new Headers(headers).forEach((value, key) => {
    result[toHeaderName(key)] = value;
  });
  return result;
}

function toHeaderName(value: string) {
  return value
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("-");
}
