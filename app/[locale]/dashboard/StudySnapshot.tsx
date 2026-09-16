import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { interpolate } from "@/lib/notifications/format";
import type { StudySummary } from "@/lib/dashboard/study-progress";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function StudySnapshot({
  dict,
  locale,
  name,
  summary,
}: {
  dict: Dictionary;
  locale: Locale;
  name: string;
  summary: StudySummary;
}) {
  const stats = [
    { label: dict.dashboard.totalAttempts, value: String(summary.total) },
    { label: dict.dashboard.averageScore, value: `${summary.averageScore}%` },
    { label: dict.dashboard.masteredLabel, value: String(summary.masteredCount) },
  ];

  return (
    <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
            {interpolate(dict.dashboard.greeting, { name })}
          </h1>
          <p className="mt-2 max-w-xl text-base font-semibold leading-7 text-white/85">
            {summary.total > 0 ? dict.dashboard.studentSubtitle : dict.dashboard.welcome}
          </p>
        </div>

        <Link
          href={`/${locale}/quizzes`}
          className="inline-flex min-h-12 flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-orange px-6 text-base font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue"
        >
          {summary.total > 0 ? dict.dashboard.continueStudying : dict.dashboard.startCta}
          <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2.6} />
        </Link>
      </div>

      {summary.total > 0 ? (
        <dl className="grid grid-cols-3 divide-x divide-white/15 border-t border-white/15">
          {stats.map((stat) => (
            <div key={stat.label} className="px-4 py-4 text-center sm:px-6">
              <dt className="text-xs font-bold uppercase tracking-wide text-white/70">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-black tabular-nums text-white sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
