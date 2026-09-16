import type { AuthResponse, AuthTokens, AuthUser } from "./contracts";
import { decodeJwtExpiry } from "./jwt";

export const SESSION_STATUS = {
  authenticated: "authenticated",
  refreshed: "refreshed",
  anonymous: "anonymous",
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

type SessionTokens = {
  accessToken?: string;
  refreshToken?: string;
};

type SessionClient = {
  me(accessToken: string): Promise<AuthResponse<AuthUser>>;
  refresh(refreshToken: string): Promise<AuthResponse<{ tokens: AuthTokens }>>;
};

export type SessionResult =
  | { status: typeof SESSION_STATUS.authenticated; user: AuthUser }
  | { status: typeof SESSION_STATUS.refreshed; user: AuthUser; tokens: AuthTokens }
  | { status: typeof SESSION_STATUS.anonymous; clear?: boolean };

export async function resolveSession(tokens: SessionTokens, client: SessionClient): Promise<SessionResult> {
  if (!tokens.accessToken && !tokens.refreshToken) return { status: SESSION_STATUS.anonymous, clear: false };

  if (tokens.accessToken) {
    const current = await client.me(tokens.accessToken);
    if (current.ok) return { status: SESSION_STATUS.authenticated, user: current.data };
    if (current.status !== 401) return { status: SESSION_STATUS.anonymous };
  }

  if (!tokens.refreshToken) return { status: SESSION_STATUS.anonymous, clear: true };

  const refreshed = await client.refresh(tokens.refreshToken);
  if (!refreshed.ok) return { status: SESSION_STATUS.anonymous, clear: true };

  const next = await client.me(refreshed.data.tokens.accessToken);
  if (!next.ok) return { status: SESSION_STATUS.anonymous, clear: true };

  return { status: SESSION_STATUS.refreshed, user: next.data, tokens: refreshed.data.tokens };
}

export type OptimisticSessionResult =
  | { status: typeof SESSION_STATUS.authenticated }
  | { status: typeof SESSION_STATUS.refreshed; tokens: AuthTokens }
  | { status: typeof SESSION_STATUS.anonymous; clear?: boolean };

export async function resolveSessionOptimistic(
  tokens: SessionTokens,
  client: Pick<SessionClient, "refresh">,
  now: number = Date.now()
): Promise<OptimisticSessionResult> {
  if (!tokens.accessToken && !tokens.refreshToken) return { status: SESSION_STATUS.anonymous, clear: false };

  const skewMs = 30_000;
  const exp = tokens.accessToken ? decodeJwtExpiry(tokens.accessToken) : null;
  if (exp !== null && exp * 1000 > now + skewMs) return { status: SESSION_STATUS.authenticated };

  if (!tokens.refreshToken) return { status: SESSION_STATUS.anonymous, clear: true };

  const refreshed = await client.refresh(tokens.refreshToken);
  if (!refreshed.ok) return { status: SESSION_STATUS.anonymous, clear: true };
  return { status: SESSION_STATUS.refreshed, tokens: refreshed.data.tokens };
}

export function isAnonymousSession<T extends { status: SessionStatus }>(
  session: T
): session is Extract<T, { status: typeof SESSION_STATUS.anonymous }> {
  return session.status === SESSION_STATUS.anonymous;
}

export function wasSessionRefreshed<T extends { status: SessionStatus }>(
  session: T
): session is Extract<T, { status: typeof SESSION_STATUS.refreshed }> {
  return session.status === SESSION_STATUS.refreshed;
}

export function resolveAccessToken(session: SessionResult, cookieAccessToken?: string) {
  return wasSessionRefreshed(session) ? session.tokens.accessToken : cookieAccessToken;
}

export function refreshedTokens(session: SessionResult | OptimisticSessionResult): AuthTokens | null {
  return wasSessionRefreshed(session) ? session.tokens : null;
}

export function toSessionState(session: { status: SessionStatus }) {
  return isAnonymousSession(session) ? SESSION_STATUS.anonymous : SESSION_STATUS.authenticated;
}
