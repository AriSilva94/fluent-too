import type { AuthErrorCode, TeacherRegisterPayload } from "./contracts";
import { validateRegister } from "./validation";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const SUPPORTED_LANGUAGES = ["pt", "en", "fr"];

export type TeacherRegisterResult =
  | { ok: true; data: TeacherRegisterPayload }
  | { ok: false; fieldErrors: Record<string, "REQUIRED" | "INVALID_EMAIL" | "WEAK_PASSWORD" | "PASSWORDS_DO_NOT_MATCH"> };

export function validateTeacherRegister(input: TeacherRegisterPayload): TeacherRegisterResult {
  const base = validateRegister({
    email: input.email,
    password: input.password,
    passwordConfirmation: input.passwordConfirmation,
  });
  if (!base.ok) return base;

  const bio = (input.bio ?? "").trim();
  const experience = (input.experience ?? "").trim();
  const languages = (input.languages ?? []).filter((language) => SUPPORTED_LANGUAGES.includes(language));

  if (!bio) return { ok: false, fieldErrors: { bio: "REQUIRED" } };
  if (!experience) return { ok: false, fieldErrors: { experience: "REQUIRED" } };
  if (languages.length === 0) return { ok: false, fieldErrors: { languages: "REQUIRED" } };

  return {
    ok: true,
    data: {
      ...base.data,
      bio,
      experience,
      languages,
      ...(input.credentialUrl?.trim() ? { credentialUrl: input.credentialUrl.trim() } : {}),
    },
  };
}

export function validateAttachment(
  file: { size: number; type: string } | null
): { ok: true } | { ok: false; error: Extract<AuthErrorCode, "FILE_TOO_LARGE" | "INVALID_FILE_TYPE"> } {
  if (!file) return { ok: true };
  if (file.size > MAX_ATTACHMENT_BYTES) return { ok: false, error: "FILE_TOO_LARGE" };
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) return { ok: false, error: "INVALID_FILE_TYPE" };
  return { ok: true };
}
