import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, BookOpenCheck, CircleCheck, Newspaper, UserRoundCheck, type LucideIcon } from "lucide-react";
import { getDictionary, type Dictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { canManageContent, hasProfile } from "@/lib/auth/roles";
import { createQuizManageClient } from "@/lib/quizzes/manage-client";
import { createBlogManageClient } from "@/lib/blog/manage-client";
import { createTeacherApplicationsClient } from "@/lib/teacher-applications/client";
import { countPublicationState, fillSummary } from "@/lib/admin/overview";

const adminDescriptions: Record<Locale, string> = {
  "pt-br": "Painel administrativo da Fluent Too para gestão de conteúdo e usuários.",
  "en-us": "Fluent Too admin panel for content and user management.",
  "fr-fr": "Panneau d'administration Fluent Too pour la gestion du contenu et des utilisateurs.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/admin",
    title: `${dict.admin.title} | Fluent Too`,
    description: adminDescriptions[locale],
    index: false,
  });
}

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
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

  if (isAnonymousSession(session)) redirect(`/${locale}/login?returnTo=/${locale}/admin`);
  if (!hasProfile(session.user.role?.type)) redirect(`/${locale}/onboarding`);
  if (!canManageContent(session.user.role?.type)) notFound();

  const accessToken = wasSessionRefreshed(session)
    ? session.tokens.accessToken
    : cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;

  const [quizzes, posts, pending] = accessToken
    ? await Promise.all([
        createQuizManageClient()
          .listAll(accessToken)
          .then((result) => (result.ok ? result.data : null)),
        createBlogManageClient()
          .list(accessToken)
          .then((result) => (result.ok ? result.data : null)),
        createTeacherApplicationsClient()
          .list(accessToken, "pending")
          .then((result) => (result.ok ? result.data.length : null)),
      ])
    : [null, null, null];

  const sections: SectionCard[] = [
    {
      href: `/${locale}/admin/quizzes`,
      title: dict.admin.quizzesTitle,
      text: dict.admin.quizzesSubtitle,
      summary: fillSummary(dict.admin.hubQuizzesSummary, countPublicationState(quizzes)),
      icon: BookOpenCheck,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      href: `/${locale}/admin/blog`,
      title: dict.admin.blogTitle,
      text: dict.admin.blogSubtitle,
      summary: fillSummary(dict.admin.hubBlogSummary, countPublicationState(posts)),
      icon: Newspaper,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      href: `/${locale}/admin/teachers`,
      title: dict.admin.teachersTitle,
      text: dict.admin.teachersSubtitle,
      summary: null,
      icon: UserRoundCheck,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="p-5 sm:p-6">
            <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">{dict.admin.title}</h1>
            <p className="mt-2 max-w-2xl text-base font-semibold leading-6 text-white/90">{dict.admin.hubSubtitle}</p>
          </div>
        </section>

        <PendingApplications locale={locale} dict={dict} pending={pending} />

        <nav aria-label={dict.admin.title} className="mt-4 grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <SectionLink key={section.href} section={section} openLabel={dict.admin.hubOpen} />
          ))}
        </nav>
      </div>
    </div>
  );
}

type SectionCard = {
  href: string;
  title: string;
  text: string;
  summary: string | null;
  icon: LucideIcon;
  tone: string;
};

function PendingApplications({ locale, dict, pending }: { locale: Locale; dict: Dictionary; pending: number | null }) {
  if (pending === null) return null;

  if (pending === 0) {
    return (
      <p className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-neutral-600 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
        <CircleCheck aria-hidden className="h-5 w-5 shrink-0 text-emerald-600" />
        {dict.admin.hubNoPending}
      </p>
    );
  }

  return (
    <section className="mt-4 grid gap-4 rounded-2xl bg-white p-5 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex items-center gap-4">
        <span className="text-4xl font-black leading-none text-brand-orange tabular-nums">{pending}</span>
        <span className="text-base font-bold leading-6 text-neutral-800">{dict.admin.hubPendingLabel}</span>
      </div>

      <Link
        href={`/${locale}/admin/teachers`}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
      >
        {dict.admin.hubPendingCta}
      </Link>
    </section>
  );
}

function SectionLink({ section, openLabel }: { section: SectionCard; openLabel: string }) {
  const Icon = section.icon;

  return (
    <Link
      href={section.href}
      className="group flex flex-col rounded-2xl bg-white p-5 shadow-[0_18px_54px_rgba(65,132,249,0.12)] transition-shadow hover:shadow-[0_24px_70px_rgba(65,132,249,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
    >
      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${section.tone}`}>
        <Icon aria-hidden className="h-5 w-5" />
      </span>

      <h2 className="mt-4 text-lg font-black text-brand-blue">{section.title}</h2>
      <p className="mt-2 flex-1 text-sm font-medium leading-6 text-neutral-600">{section.text}</p>

      {section.summary && <p className="mt-4 text-sm font-bold text-neutral-800 tabular-nums">{section.summary}</p>}

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-brand-orange">
        {openLabel}
        <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
