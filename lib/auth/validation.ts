export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: Record<string, string> };

export type LoginPayload = {
  email: string;
  password: string;
};

export function validateLogin(input: LoginPayload): ValidationResult<LoginPayload> {
  return {
    ok: true,
    data: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
  };
}
