import { cookies } from "next/headers";
import { STUDY_LANGUAGE_COOKIE, parseStudyLanguage, toTargetLanguage, type StudyLanguage } from "./study-language";
import type { TargetLanguage } from "@/lib/quizzes/types";

export async function readStudyLanguage(): Promise<StudyLanguage> {
  const cookieStore = await cookies();
  return parseStudyLanguage(cookieStore.get(STUDY_LANGUAGE_COOKIE)?.value);
}

export async function readStudyTargetLanguage(): Promise<TargetLanguage | undefined> {
  return toTargetLanguage(await readStudyLanguage());
}
