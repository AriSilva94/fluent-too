import type { AuthErrorCode, TeacherApplicationPayload } from "./contracts";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const SUPPORTED_LANGUAGES = ["pt", "en", "fr"];

export type TeacherApplicationResult =
  | { ok: true; data: TeacherApplicationPayload }
  | { ok: false; fieldErrors: Record<string, "REQUIRED"> };

export function validateTeacherApplication(input: TeacherApplicationPayload): TeacherApplicationResult {
  const bio = (input.bio ?? "").trim();
  const experience = (input.experience ?? "").trim();
  const languages = (input.languages ?? []).filter((language) => SUPPORTED_LANGUAGES.includes(language));

  if (!bio) return { ok: false, fieldErrors: { bio: "REQUIRED" } };
  if (!experience) return { ok: false, fieldErrors: { experience: "REQUIRED" } };
  if (languages.length === 0) return { ok: false, fieldErrors: { languages: "REQUIRED" } };

  return {
    ok: true,
    data: {
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
