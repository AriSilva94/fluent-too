import {
  buildClearCookieInstructions,
  buildCookieInstructions,
  type CookieInstruction,
} from "./cookies";
import { isTrustedOrigin, readLimitedJson } from "./request";
import { resolveSession } from "./session";
import {
  validateChangePassword,
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
} from "./validation";
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

type HandlerResult = {
  status: number;
  body: unknown;
  cookies?: CookieInstruction[];
};

type AuthClient = {
  login?(payload: LoginPayload): Promise<AuthResponse<AuthSuccess>>;
  register?(payload: RegisterPayload): Promise<AuthResponse<RegistrationSuccess>>;
  forgotPassword?(payload: ForgotPasswordPayload): Promise<AuthResponse<{ ok: true }>>;
  resetPassword?(payload: ResetPasswordPayload): Promise<AuthResponse<AuthSuccess>>;
  resendConfirmation?(payload: ForgotPasswordPayload): Promise<AuthResponse<{ ok: true }>>;
  changePassword?(accessToken: string, payload: ChangePasswordPayload): Promise<AuthResponse<AuthSuccess>>;
  logout?(accessToken: string, refreshToken: string): Promise<AuthResponse<unknown>>;
  me?(accessToken: string): Promise<AuthResponse<AuthUser>>;
  refresh?(refreshToken: string): Promise<AuthResponse<{ tokens: AuthTokens }>>;
};

type RequestHandlerOptions = {
  client: AuthClient;
  siteUrl: string;
  secureCookies?: boolean;
};

export async function handleLogin(request: Request, options: RequestHandlerOptions): Promise<HandlerResult> {
  const denied = ensureTrusted(request, options.siteUrl);
  if (denied) return denied;
  const payload = validateLogin((await readLimitedJson(request)) as LoginPayload);
  if (!payload.ok) return { status: 400, body: { ok: false, fieldErrors: payload.fieldErrors } };

  const response = await options.client.login?.(payload.data);
  return authResponseToHandler(response, options.secureCookies);
}

export async function handleRegister(request: Request, options: RequestHandlerOptions): Promise<HandlerResult> {
  const denied = ensureTrusted(request, options.siteUrl);
  if (denied) return denied;
  const payload = validateRegister((await readLimitedJson(request)) as RegisterPayload);
  if (!payload.ok) return { status: 400, body: { ok: false, fieldErrors: payload.fieldErrors } };

  const response = await options.client.register?.(payload.data);
  return registrationResponseToHandler(response, options.secureCookies);
}

export async function handleForgotPassword(request: Request, options: RequestHandlerOptions): Promise<HandlerResult> {
  const denied = ensureTrusted(request, options.siteUrl);
  if (denied) return denied;
  const payload = validateForgotPassword((await readLimitedJson(request)) as ForgotPasswordPayload);
  if (payload.ok) await options.client.forgotPassword?.(payload.data);
  return { status: 200, body: { ok: true } };
}

export async function handleResetPassword(request: Request, options: RequestHandlerOptions): Promise<HandlerResult> {
  const denied = ensureTrusted(request, options.siteUrl);
  if (denied) return denied;
  const payload = validateResetPassword((await readLimitedJson(request)) as ResetPasswordPayload);
  if (!payload.ok) return { status: 400, body: { ok: false, fieldErrors: payload.fieldErrors } };

  const response = await options.client.resetPassword?.(payload.data);
  return authResponseToHandler(response, options.secureCookies);
}

export async function handleResendConfirmation(request: Request, options: RequestHandlerOptions): Promise<HandlerResult> {
  const denied = ensureTrusted(request, options.siteUrl);
  if (denied) return denied;
  const payload = validateForgotPassword((await readLimitedJson(request)) as ForgotPasswordPayload);
  if (payload.ok) await options.client.resendConfirmation?.(payload.data);
  return { status: 200, body: { ok: true } };
}

export async function handleChangePassword(
  request: Request,
  tokens: { accessToken?: string },
  options: RequestHandlerOptions
): Promise<HandlerResult> {
  const denied = ensureTrusted(request, options.siteUrl);
  if (denied) return denied;
  if (!tokens.accessToken) return { status: 401, body: { ok: false, error: "UNAUTHORIZED" } };
  const payload = validateChangePassword((await readLimitedJson(request)) as ChangePasswordPayload);
  if (!payload.ok) return { status: 400, body: { ok: false, fieldErrors: payload.fieldErrors } };

  const response = await options.client.changePassword?.(tokens.accessToken, payload.data);
  return authResponseToHandler(response, options.secureCookies);
}

export async function handleSession(
  tokens: { accessToken?: string; refreshToken?: string },
  options: { client: AuthClient; secureCookies?: boolean }
): Promise<HandlerResult> {
  if (!options.client.me || !options.client.refresh) return { status: 200, body: { ok: false, user: null } };
  const session = await resolveSession(tokens, {
    me: options.client.me,
    refresh: options.client.refresh,
  });

  if (session.status === "authenticated") return { status: 200, body: { ok: true, user: session.user } };
  if (session.status === "refreshed") {
    return {
      status: 200,
      body: { ok: true, user: session.user },
      cookies: buildCookieInstructions(session.tokens, options.secureCookies),
    };
  }
  return {
    status: 200,
    body: { ok: false, user: null },
    cookies: session.clear ? buildClearCookieInstructions() : undefined,
  };
}

export async function handleLogout(
  tokens: { accessToken?: string; refreshToken?: string },
  options: { client: AuthClient }
): Promise<HandlerResult> {
  if (tokens.accessToken && tokens.refreshToken) {
    const response = await options.client.logout?.(tokens.accessToken, tokens.refreshToken);
    if (response && !response.ok) {
      console.error("Falha ao revogar refresh token no logout", response.error);
    }
  }
  return { status: 200, body: { ok: true }, cookies: buildClearCookieInstructions() };
}

function ensureTrusted(request: Request, siteUrl: string): HandlerResult | null {
  if (isTrustedOrigin(request.headers.get("origin"), siteUrl)) return null;
  return { status: 403, body: { ok: false, error: "INVALID_ORIGIN" } };
}

function authResponseToHandler(response: AuthResponse<AuthSuccess> | undefined, secureCookies?: boolean): HandlerResult {
  if (!response) return { status: 503, body: { ok: false, error: "SERVICE_UNAVAILABLE" } };
  if (!response.ok) return { status: mapClientStatus(response.error, response.status), body: { ok: false, error: response.error } };
  return {
    status: 200,
    body: { ok: true, user: response.data.user },
    cookies: buildCookieInstructions(response.data.tokens, secureCookies),
  };
}

function registrationResponseToHandler(
  response: AuthResponse<RegistrationSuccess> | undefined,
  secureCookies?: boolean
): HandlerResult {
  if (!response) return { status: 503, body: { ok: false, error: "SERVICE_UNAVAILABLE" } };
  if (!response.ok) return { status: mapClientStatus(response.error, response.status), body: { ok: false, error: response.error } };
  return {
    status: 200,
    body: { ok: true, user: response.data.user },
    cookies: response.data.tokens ? buildCookieInstructions(response.data.tokens, secureCookies) : undefined,
  };
}

function mapClientStatus(error: string, status: number) {
  if (error === "INVALID_CREDENTIALS") return 401;
  if (error === "EMAIL_NOT_CONFIRMED") return 403;
  return status;
}
