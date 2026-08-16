import type { AuthResponse, AuthTokens, AuthUser } from "./contracts";

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
