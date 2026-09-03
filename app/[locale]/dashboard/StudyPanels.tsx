import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import LanguageFlag from "@/components/ui/LanguageFlag";
import LevelTag from "@/components/ui/LevelTag";
import { interpolate } from "@/lib/notifications/format";
import type { StudySummary } from "@/lib/dashboard/study-progress";
import type { QuizAttempt } from "@/lib/quiz-attempts/types";
import type { Quiz } from "@/lib/quizzes/types";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

const PANEL = "rounded-2xl bg-white p-5 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:p-6";

export function ResumePanel({ dict, locale, attempt }: { dict: Dictionary; locale: Locale; attempt: QuizAttempt }) {
  return (
    <section className={PANEL}>
      <h2 className="text-sm font-black uppercase tracking-wide text-brand-blue">{dict.dashboard.resumeTitle}</h2>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xl font-black text-gray-950">{attempt.quizTitle}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-neutral-500">
            <LanguageFlag language={attempt.targetLanguage} label={dict.languages[attempt.targetLanguage] ?? attempt.targetLanguage.toUpperCase()} />
            <LevelTag level={attempt.level} />
            <span className="tabular-nums">{interpolate(dict.dashboard.resumeMeta, { score: attempt.score })}</span>
          </div>
        </div>
        <Link
          href={`/${locale}/quizzes/${attempt.quizSlug}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          <PlayCircle aria-hidden className="h-4 w-4" strokeWidth={2.4} />
          {dict.dashboard.resumeCta}
        </Link>
      </div>
    </section>
  );
}

export function LanguageProgressPanel({ dict, summary }: { dict: Dictionary; summary: StudySummary }) {
  return (
    <section className={PANEL}>
      <h2 className="text-sm font-black uppercase tracking-wide text-brand-blue">{dict.dashboard.progressTitle}</h2>
      <ul className="mt-4 grid gap-4">
        {summary.byLanguage.map((entry) => (
          <li key={entry.language}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="flex items-center gap-2 text-base font-black text-gray-950">
                <LanguageFlag language={entry.language} label={dict.languages[entry.language] ?? entry.language.toUpperCase()} />
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                <span className="tabular-nums">{interpolate(dict.dashboard.progressAttempts, { count: entry.attempts })}</span>
                <span aria-hidden className="text-neutral-300">·</span>
                <span className="tabular-nums">{interpolate(dict.dashboard.progressAverage, { score: entry.averageScore })}</span>
                <LevelTag level={entry.topLevel} />
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-brand-blue"
                style={{ width: `${Math.max(entry.averageScore, 4)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RecommendedPanel({ dict, locale, quizzes }: { dict: Dictionary; locale: Locale; quizzes: Quiz[] }) {
  return (
    <section className={PANEL}>
      <h2 className="text-sm font-black uppercase tracking-wide text-brand-blue">{dict.dashboard.recommendedTitle}</h2>

      {quizzes.length === 0 ? (
        <p className="mt-4 text-sm font-semibold text-neutral-600">{dict.dashboard.recommendedEmpty}</p>
      ) : (
        <ul className="mt-4 grid gap-2">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/${locale}/quizzes/${quiz.id}`}
                className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-3 transition-colors hover:border-brand-orange/60 hover:bg-orange-50/60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-gray-950">{quiz.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs font-bold text-neutral-500">
                    <LanguageFlag language={quiz.targetLanguage} label={dict.languages[quiz.targetLanguage] ?? quiz.targetLanguage.toUpperCase()} />
                    <LevelTag level={quiz.level} />
                  </span>
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 flex-shrink-0 text-neutral-300" strokeWidth={2.4} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/${locale}/quizzes`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-brand-orange transition-colors hover:text-brand-orange/80"
      >
        {dict.dashboard.recommendedCta}
        <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={2.6} />
      </Link>
    </section>
  );
}
