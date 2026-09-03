import Link from "next/link";
import LanguageFlag from "@/components/ui/LanguageFlag";
import LevelTag from "@/components/ui/LevelTag";
import { LanguageProgressPanel, RecommendedPanel, ResumePanel } from "./StudyPanels";
import type { StudySummary } from "@/lib/dashboard/study-progress";
import type { QuizAttempt } from "@/lib/quiz-attempts/types";
import type { Quiz } from "@/lib/quizzes/types";
import type { Dictionary } from "@/lib/getDictionary";
import { localeToHtmlLang, type Locale } from "@/lib/i18n";

const PANEL = "rounded-2xl bg-white p-5 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:p-6";

export default function StudentBody({
  dict,
  locale,
  summary,
  attempts,
  recommended,
}: {
  dict: Dictionary;
  locale: Locale;
  summary: StudySummary;
  attempts: QuizAttempt[];
  recommended: Quiz[];
}) {
  if (summary.total === 0) {
    return (
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <section className={PANEL}>
          <h2 className="text-xl font-black text-brand-blue">{dict.dashboard.startTitle}</h2>
          <p className="mt-3 max-w-prose text-base font-medium leading-7 text-neutral-600">{dict.dashboard.startText}</p>
          <Link
            href={`/${locale}/quizzes`}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            {dict.dashboard.startCta}
          </Link>
        </section>
        <RecommendedPanel dict={dict} locale={locale} quizzes={recommended} />
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-4">
        {summary.lastAttempt ? <ResumePanel dict={dict} locale={locale} attempt={summary.lastAttempt} /> : null}
        <LanguageProgressPanel dict={dict} summary={summary} />
        <ActivityPanel dict={dict} locale={locale} attempts={attempts} />
      </div>
      <RecommendedPanel dict={dict} locale={locale} quizzes={recommended} />
    </div>
  );
}

function ActivityPanel({ dict, locale, attempts }: { dict: Dictionary; locale: Locale; attempts: QuizAttempt[] }) {
  const dateFormatter = new Intl.DateTimeFormat(localeToHtmlLang[locale], { day: "numeric", month: "short" });

  return (
    <section className={PANEL}>
      <h2 className="text-sm font-black uppercase tracking-wide text-brand-blue">{dict.dashboard.recentActivity}</h2>

      {attempts.length === 0 ? (
        <p className="mt-4 text-sm font-semibold text-neutral-600">{dict.dashboard.noActivity}</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100">
          {attempts.slice(0, 6).map((attempt) => {
            const when = attempt.completedAt ?? attempt.createdAt;
            const parsed = when ? Date.parse(when) : Number.NaN;

            return (
              <li key={attempt.id} className="flex items-center gap-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-black text-gray-950">{attempt.quizTitle}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs font-bold text-neutral-500">
                    <LanguageFlag
                      language={attempt.targetLanguage}
                      label={dict.languages[attempt.targetLanguage] ?? attempt.targetLanguage.toUpperCase()}
                    />
                    <LevelTag level={attempt.level} />
                    {Number.isNaN(parsed) ? null : <span className="tabular-nums">{dateFormatter.format(parsed)}</span>}
                  </span>
                </span>
                <span className="flex-shrink-0 text-xl font-black tabular-nums text-brand-orange">{attempt.score}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
