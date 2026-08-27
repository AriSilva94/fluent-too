import type { AuthErrorCode } from "./contracts";

export function mapStrapiError(status: number, message: unknown): AuthErrorCode {
  const normalized = String(message ?? "").toLowerCase();

  if (status === 401) return "UNAUTHORIZED";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVICE_UNAVAILABLE";
  if (normalized.includes("invalid identifier") || normalized.includes("invalid email or password")) {
    return "INVALID_CREDENTIALS";
  }
  if (normalized.includes("email is not confirmed") || normalized.includes("account email is not confirmed")) {
    return "EMAIL_NOT_CONFIRMED";
  }
  if (normalized.includes("email is already taken")) {
    return "EMAIL_ALREADY_REGISTERED";
  }
  if (normalized.includes("token")) return "INVALID_TOKEN";

  return "UNKNOWN_ERROR";
}
