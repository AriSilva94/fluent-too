import QuizSectionClient from "@/components/home/QuizSectionClient";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { getQuizzesGroupedByLevels } from "@/lib/quizzes/data";
import type { Quiz, QuizLevel } from "@/lib/quizzes/types";
import { LEVELS, type LevelDisplay } from "@/lib/constants";

type QuizSectionProps = {
  locale: Locale;
  dict: Dictionary;
};

export default async function QuizSection({ locale, dict }: QuizSectionProps) {
  const groups = await getQuizzesGroupedByLevels(LEVELS.map(getLevelsForDisplay), locale);
  const quizzesByLevel = Object.fromEntries(LEVELS.map((level, index) => [level, groups[index]])) as Record<
    LevelDisplay,
    Quiz[]
  >;

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
