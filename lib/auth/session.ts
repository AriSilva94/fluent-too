import type { AuthResponse, AuthTokens, AuthUser } from "./contracts";
import { decodeJwtExpiry } from "./jwt";

type SessionTokens = {
  accessToken?: string;
  refreshToken?: string;
};

type SessionClient = {
  me(accessToken: string): Promise<AuthResponse<AuthUser>>;
  refresh(refreshToken: string): Promise<AuthResponse<{ tokens: AuthTokens }>>;
};

export type SessionResult =
  | { status: "authenticated"; user: AuthUser }
  | { status: "refreshed"; user: AuthUser; tokens: AuthTokens }
  | { status: "anonymous"; clear?: boolean };

export async function resolveSession(tokens: SessionTokens, client: SessionClient): Promise<SessionResult> {
  if (!tokens.accessToken || !tokens.refreshToken) return { status: "anonymous", clear: Boolean(tokens.accessToken || tokens.refreshToken) };

  const current = await client.me(tokens.accessToken);
  if (current.ok) return { status: "authenticated", user: current.data };
  if (current.status !== 401) return { status: "anonymous" };

  const refreshed = await client.refresh(tokens.refreshToken);
  if (!refreshed.ok) return { status: "anonymous", clear: true };

  const next = await client.me(refreshed.data.tokens.accessToken);
  if (!next.ok) return { status: "anonymous", clear: true };

  return { status: "refreshed", user: next.data, tokens: refreshed.data.tokens };
}

export type OptimisticSessionResult =
  | { status: "authenticated" }
  | { status: "refreshed"; tokens: AuthTokens }
  | { status: "anonymous"; clear?: boolean };

export async function resolveSessionOptimistic(
  tokens: SessionTokens,
  client: Pick<SessionClient, "refresh">,
  now: number = Date.now()
): Promise<OptimisticSessionResult> {
  if (!tokens.accessToken || !tokens.refreshToken) {
    return { status: "anonymous", clear: Boolean(tokens.accessToken || tokens.refreshToken) };
  }

  const skewMs = 30_000;
  const exp = decodeJwtExpiry(tokens.accessToken);
  if (exp !== null && exp * 1000 > now + skewMs) return { status: "authenticated" };

  const refreshed = await client.refresh(tokens.refreshToken);
  if (!refreshed.ok) return { status: "anonymous", clear: true };
  return { status: "refreshed", tokens: refreshed.data.tokens };
}
