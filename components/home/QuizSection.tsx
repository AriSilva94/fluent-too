import QuizSectionClient from "@/components/home/QuizSectionClient";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { getQuizzesByLevels } from "@/lib/quizzes/data";
import type { Quiz, QuizLevel } from "@/lib/quizzes/types";
import { LEVELS, type LevelDisplay } from "@/lib/constants";

type QuizSectionProps = {
  locale: Locale;
  dict: Dictionary;
};

export default async function QuizSection({ locale, dict }: QuizSectionProps) {
  const entries = await Promise.all(
    LEVELS.map(async (level) => [level, await getQuizzesByLevels(getLevelsForDisplay(level), locale)] as const)
  );
  const quizzesByLevel = Object.fromEntries(entries) as Record<LevelDisplay, Quiz[]>;

  return <QuizSectionClient locale={locale} dict={dict} quizzesByLevel={quizzesByLevel} />;
}

function getLevelsForDisplay(level: LevelDisplay): QuizLevel[] {
  switch (level) {
    case "C1/C2":
      return ["C1", "C2"];
    default:
      return [level];
  }
}
