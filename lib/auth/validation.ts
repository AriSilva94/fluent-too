import type {
  ChangePasswordPayload,
  FieldErrorCode,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ValidationResult,
} from "./contracts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(input: LoginPayload): ValidationResult<LoginPayload> {
  const email = normalizeEmail(input.email);
  const fieldErrors: Record<string, FieldErrorCode> = {};

  if (!emailPattern.test(email)) fieldErrors.email = "INVALID_EMAIL";
  if (!input.password) fieldErrors.password = "REQUIRED";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: {
      email,
      password: input.password,
    },
  };
}

export function validateRegister(input: RegisterPayload): ValidationResult<RegisterPayload> {
  const email = normalizeEmail(input.email);
  const fieldErrors = validateNewPassword(email, input.password, input.passwordConfirmation);
  if (!emailPattern.test(email)) fieldErrors.email = "INVALID_EMAIL";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: { email, password: input.password, passwordConfirmation: input.passwordConfirmation },
  };
}

export function validateForgotPassword(input: ForgotPasswordPayload): ValidationResult<ForgotPasswordPayload> {
  const email = normalizeEmail(input.email);
  if (!emailPattern.test(email)) return { ok: false, fieldErrors: { email: "INVALID_EMAIL" } };
  return { ok: true, data: { email } };
}

export function validateResetPassword(input: ResetPasswordPayload): ValidationResult<ResetPasswordPayload> {
  const fieldErrors = validateNewPassword("", input.password, input.passwordConfirmation);
  if (!input.code.trim()) fieldErrors.code = "REQUIRED";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: {
      code: input.code.trim(),
      password: input.password,
      passwordConfirmation: input.passwordConfirmation,
    },
  };
}

export function validateChangePassword(input: ChangePasswordPayload): ValidationResult<ChangePasswordPayload> {
  const fieldErrors = validateNewPassword("", input.password, input.passwordConfirmation);
  if (!input.currentPassword) fieldErrors.currentPassword = "REQUIRED";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return { ok: true, data: input };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateNewPassword(
  email: string,
  password: string,
  passwordConfirmation: string
): Record<string, FieldErrorCode> {
  const fieldErrors: Record<string, FieldErrorCode> = {};
  const passwordBytes = new TextEncoder().encode(password).byteLength;

  if (passwordBytes < 8 || passwordBytes > 72) fieldErrors.password = "WEAK_PASSWORD";
  if (password !== passwordConfirmation) fieldErrors.passwordConfirmation = "PASSWORDS_DO_NOT_MATCH";
  if (email && password.toLowerCase() === email.toLowerCase()) fieldErrors.password = "WEAK_PASSWORD";

  return fieldErrors;
}
