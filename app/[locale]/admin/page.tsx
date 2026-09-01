import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession } from "@/lib/auth/session";
import { canManageContent, hasProfile } from "@/lib/auth/roles";

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

  const sections = [
    { href: `/${locale}/admin/quizzes`, title: dict.admin.quizzesTitle, text: dict.admin.quizzesSubtitle },
    { href: `/${locale}/admin/blog`, title: dict.admin.blogTitle, text: dict.admin.blogSubtitle },
    { href: `/${locale}/admin/teachers`, title: dict.admin.teachersTitle, text: dict.admin.subtitle },
  ];

  return (
    <div className="bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="p-6 sm:p-8 lg:p-10">
            <h1 className="text-4xl font-black leading-none text-white sm:text-5xl">{dict.admin.title}</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/90">{dict.admin.hubSubtitle}</p>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)] transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            >
              <h2 className="text-xl font-black text-brand-blue">{section.title}</h2>
              <p className="mt-3 text-base font-medium leading-7 text-neutral-600">{section.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
