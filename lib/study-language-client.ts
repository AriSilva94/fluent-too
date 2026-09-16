import { STUDY_LANGUAGE_COOKIE, STUDY_LANGUAGE_MAX_AGE, type StudyLanguage } from "./study-language";

export function persistStudyLanguage(value: StudyLanguage) {
  if (typeof document === "undefined") return;
  document.cookie = `${STUDY_LANGUAGE_COOKIE}=${value}; path=/; max-age=${STUDY_LANGUAGE_MAX_AGE}; SameSite=Lax`;
}
