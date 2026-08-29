export type AppRole = "super_admin" | "app_admin" | "teacher" | "teacher_pending" | "student" | "unassigned";

export type AuthUser = {
  id: number;
  email: string;
  username?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: { id: number; name: string; type: AppRole } | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthErrorCode =
  | "INVALID_EMAIL"
  | "WEAK_PASSWORD"
  | "PASSWORDS_DO_NOT_MATCH"
  | "REQUIRED"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "EMAIL_ALREADY_REGISTERED"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "UNAUTHORIZED"
  | "INVALID_TOKEN"
  | "GOOGLE_AUTH_FAILED"
  | "INVALID_ORIGIN"
  | "PAYLOAD_TOO_LARGE"
  | "UNKNOWN_ERROR"
  | "TEACHER_APPLICATION_EXISTS"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "REVIEW_NOTE_REQUIRED"
  | "ALREADY_REVIEWED"
  | "PROFILE_ALREADY_SET";

export type AuthResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: AuthErrorCode; status: number };

export type FieldErrorCode = Extract<
  AuthErrorCode,
  "INVALID_EMAIL" | "WEAK_PASSWORD" | "PASSWORDS_DO_NOT_MATCH" | "REQUIRED"
>;

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, FieldErrorCode> };

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  code: string;
  password: string;
  passwordConfirmation: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
};

export type AuthSuccess = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type RegistrationSuccess = {
  user: AuthUser;
  tokens?: AuthTokens;
};

export type TeacherApplicationPayload = {
  bio: string;
  experience: string;
  languages: string[];
  credentialUrl?: string;
};
