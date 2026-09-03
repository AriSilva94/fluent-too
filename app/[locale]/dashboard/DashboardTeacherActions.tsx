import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { AppRole } from "@/lib/auth/contracts";
import { canCreateContent } from "@/lib/auth/roles";
import { interpolate } from "@/lib/notifications/format";
import type { TeacherReach } from "@/lib/teacher/reach-client";

type DashboardTeacherActionsProps = {
  locale: Locale;
  role?: AppRole;
  labels: {
    title: string;
    subtitle: string;
    cta: string;
    reachTitle: string;
    reachAttempts: string;
    reachLearners: string;
    reachAverage: string;
    reachTop: string;
    reachEmpty: string;
  };
  reach?: TeacherReach | null;
};

export default function DashboardTeacherActions({ locale, role, labels, reach }: DashboardTeacherActionsProps) {
  if (!canCreateContent(role)) return null;

  const stats = reach
    ? [
        { label: labels.reachAttempts, value: String(reach.attempts) },
        { label: labels.reachLearners, value: String(reach.learners) },
        { label: labels.reachAverage, value: `${reach.averageScore}%` },
      ]
    : [];

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:p-6">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-xl font-black text-brand-blue">{labels.title}</h2>
          <p className="mt-2 text-base font-medium leading-7 text-neutral-600">{labels.subtitle}</p>
        </div>
        <Link
          href={`/${locale}/teacher/quizzes`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          {labels.cta}
        </Link>
      </div>

      {reach ? (
        <div className="mt-5 border-t border-neutral-100 pt-5">
          <h3 className="text-sm font-black uppercase tracking-wide text-brand-blue">{labels.reachTitle}</h3>

          {reach.attempts === 0 ? (
            <p className="mt-3 text-sm font-semibold text-neutral-600">{labels.reachEmpty}</p>
          ) : (
            <>
              <dl className="mt-3 grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-[#f7f9fc] px-3 py-3">
                    <dt className="text-xs font-bold leading-4 text-neutral-500">{stat.label}</dt>
                    <dd className="mt-1 text-2xl font-black tabular-nums text-brand-blue-ink">{stat.value}</dd>
                  </div>
                ))}
              </dl>
              {reach.topQuiz ? (
                <p className="mt-3 truncate text-sm font-bold text-neutral-600">
                  {interpolate(labels.reachTop, { title: reach.topQuiz.title })}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
