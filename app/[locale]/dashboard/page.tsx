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
  const user = session.user;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">{dict.dashboard.title}</h1>
      <p className="mt-1 text-gray-500">{dict.dashboard.welcome}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500">{dict.login.emailLabel}</h2>
          <p className="mt-2 text-lg font-medium text-gray-900">{user.email}</p>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500">{dict.auth.changePasswordTitle}</h2>
          <Link href={`/${locale}/dashboard/security`} className="mt-2 inline-flex text-sm font-medium text-brand-orange hover:underline">
            {dict.auth.changePasswordSubmit}
          </Link>
        </section>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">{dict.dashboard.recentActivity}</h2>
        <p className="mt-4 rounded-lg border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
          {dict.dashboard.welcome}
        </p>
      </div>
    </div>
  );
}
