import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";
import { createQuizAttemptsClient } from "@/lib/quiz-attempts/client";
import { isPendingTeacher, isUnassigned } from "@/lib/auth/roles";

const dashboardDescriptions: Record<Locale, string> = {
  "pt-br": "Painel do aluno na Fluent Too com progresso, atividades e dados privados.",
  "en-us": "Student dashboard on Fluent Too with progress, activity, and private account data.",
  "fr-fr": "Tableau de bord élève sur Fluent Too avec progression, activité et données privées.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/dashboard",
    title: `${dict.dashboard.title} | Fluent Too`,
    description: dashboardDescriptions[locale],
    index: false,
  });
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const cookieStore = await cookies();
  const session = await resolveSession(
    {
      accessToken: cookieStore.get(AUTH_COOKIE_NAMES.access)?.value,
      refreshToken: cookieStore.get(AUTH_COOKIE_NAMES.refresh)?.value,
    },
    createStrapiClient()
  );

  if (session.status === "anonymous") redirect(`/${locale}/login?returnTo=/${locale}/dashboard`);
  if (isUnassigned(session.user.role?.type)) redirect(`/${locale}/onboarding`);
  const user = session.user;
  const accessToken = session.status === "refreshed" ? session.tokens.accessToken : cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;
  const attempts = accessToken ? await createQuizAttemptsClient().list(accessToken) : { ok: false as const, data: [] };
  const completedAttempts = attempts.data.length;
  const averageScore = completedAttempts > 0 ? Math.round(attempts.data.reduce((total, attempt) => total + attempt.score, 0) / completedAttempts) : 0;
  const bestScore = completedAttempts > 0 ? Math.max(...attempts.data.map((attempt) => attempt.score)) : 0;
  const metricCards = [
    { label: dict.dashboard.totalAttempts, value: completedAttempts.toString(), tone: "blue" },
    { label: dict.dashboard.averageScore, value: `${averageScore}%`, tone: "orange" },
    { label: dict.dashboard.bestScore, value: `${bestScore}%`, tone: "blue" },
  ];

  return (
    <div className="bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {isPendingTeacher(user.role?.type) && (
          <section className="mb-6 rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(255,103,0,0.12)]">
            <h2 className="text-xl font-black text-brand-orange">{dict.dashboard.teacherPendingTitle}</h2>
            <p className="mt-2 text-base font-medium leading-7 text-neutral-600">{dict.dashboard.teacherPendingText}</p>
          </section>
        )}
        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
            <div>
              <h1 className="text-4xl font-black leading-none text-white sm:text-5xl">{dict.dashboard.title}</h1>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/90">{dict.dashboard.welcome}</p>
            </div>
            <Link
              href={`/${locale}/quizzes`}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-6 text-base font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue"
            >
              {dict.dashboard.continueStudying}
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {metricCards.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-white p-5 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
              <p className={metric.tone === "orange" ? "text-sm font-black text-brand-orange" : "text-sm font-black text-brand-blue"}>
                {metric.label}
              </p>
              <p className="mt-3 text-4xl font-black leading-none text-gray-950">{metric.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
            <h2 className="text-xl font-black text-brand-blue">{dict.dashboard.profileTitle}</h2>
            <p className="mt-4 text-sm font-black text-brand-orange">{dict.login.emailLabel}</p>
            <p className="mt-1 break-words text-lg font-bold text-gray-950">{user.email}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(255,103,0,0.12)]">
            <h2 className="text-xl font-black text-brand-blue">{dict.dashboard.securityTitle}</h2>
            <p className="mt-4 text-base font-medium leading-7 text-neutral-600">{dict.auth.changePasswordSubtitle}</p>
            <Link
              href={`/${locale}/dashboard/security`}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            >
              {dict.auth.changePasswordSubmit}
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-brand-blue">{dict.dashboard.recentActivity}</h2>
        {attempts.data.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
            {attempts.data.map((attempt) => (
              <div key={attempt.id} className="grid gap-3 border-b border-brand-blue/10 px-5 py-5 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-lg font-black text-gray-950">{attempt.quizTitle}</p>
                  <p className="mt-1 text-sm font-bold text-neutral-500">
                    {attempt.targetLanguage.toUpperCase()} · {attempt.level} · {attempt.quizType.replace("-", " ")}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-2xl font-black text-brand-orange">{attempt.score}%</p>
                  <p className="text-xs font-bold text-neutral-500">
                    {(attempt.completedAt ?? attempt.createdAt) ? new Date(attempt.completedAt ?? attempt.createdAt ?? "").toLocaleDateString(locale) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-white px-6 py-8 text-base font-semibold text-neutral-600 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
            {dict.dashboard.noActivity}
          </p>
        )}
        </section>
      </div>
    </div>
  );
}
