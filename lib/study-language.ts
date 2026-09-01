import { TARGET_LANGUAGE, type TargetLanguage } from "@/lib/quizzes/types";

export const STUDY_LANGUAGE = {
  all: "all",
  pt: TARGET_LANGUAGE.pt,
  en: TARGET_LANGUAGE.en,
  fr: TARGET_LANGUAGE.fr,
} as const;

export type StudyLanguage = (typeof STUDY_LANGUAGE)[keyof typeof STUDY_LANGUAGE];

export const STUDY_LANGUAGES: StudyLanguage[] = [
  STUDY_LANGUAGE.all,
  STUDY_LANGUAGE.pt,
  STUDY_LANGUAGE.en,
  STUDY_LANGUAGE.fr,
];

export const STUDY_LANGUAGE_COOKIE = "studyLanguage";

export const STUDY_LANGUAGE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseStudyLanguage(value: unknown): StudyLanguage {
  return STUDY_LANGUAGES.includes(value as StudyLanguage) ? (value as StudyLanguage) : STUDY_LANGUAGE.all;
}

export function toTargetLanguage(value: StudyLanguage): TargetLanguage | undefined {
  return value === STUDY_LANGUAGE.all ? undefined : value;
}

export type StudyLanguageLabels = Record<StudyLanguage, string> & { legend: string };

export function buildStudyLanguageLabels(studyLanguage: { legend: string; all: string }): StudyLanguageLabels {
  return {
    legend: studyLanguage.legend,
    [STUDY_LANGUAGE.all]: studyLanguage.all,
    [STUDY_LANGUAGE.pt]: "PT",
    [STUDY_LANGUAGE.en]: "EN",
    [STUDY_LANGUAGE.fr]: "FR",
  };
}
