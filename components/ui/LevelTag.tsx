import { QUIZ_LEVEL, type QuizLevel } from "@/lib/quizzes/types";
import { cn } from "@/lib/utils";

const LEVEL_TONES: Record<QuizLevel, string> = {
  [QUIZ_LEVEL.a1]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  [QUIZ_LEVEL.a2]: "bg-teal-50 text-teal-700 ring-teal-600/20",
  [QUIZ_LEVEL.b1]: "bg-sky-50 text-sky-700 ring-sky-600/20",
  [QUIZ_LEVEL.b2]: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  [QUIZ_LEVEL.c1]: "bg-violet-50 text-violet-700 ring-violet-600/20",
  [QUIZ_LEVEL.c2]: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const FALLBACK_TONE = "bg-neutral-100 text-neutral-700 ring-neutral-500/20";

export default function LevelTag({ level }: { level: string | undefined }) {
  const tone = LEVEL_TONES[level as QuizLevel] ?? FALLBACK_TONE;

  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset", tone)}>
      {level}
    </span>
  );
}
