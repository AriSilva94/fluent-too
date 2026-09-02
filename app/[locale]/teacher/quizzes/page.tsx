import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { canCreateContent, canReviewTeachers, hasProfile } from "@/lib/auth/roles";
import { createQuizManageClient } from "@/lib/quizzes/manage-client";
import { TARGET_LANGUAGES, type TargetLanguage } from "@/lib/quizzes/manage";
import TeacherQuizzesPanel from "./TeacherQuizzesPanel";

const teacherDescriptions: Record<Locale, string> = {
  "pt-br": "Área do professor na Fluent Too para criar e editar quizzes.",
  "en-us": "Teacher area on Fluent Too to create and edit quizzes.",
  "fr-fr": "Espace enseignant sur Fluent Too pour créer et modifier des quiz.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/teacher/quizzes",
    title: `${dict.teacher.title} | Fluent Too`,
    description: teacherDescriptions[locale],
    index: false,
  });
}

export default async function TeacherQuizzesPage({ params }: { params: Promise<{ locale: string }> }) {
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

  if (isAnonymousSession(session)) redirect(`/${locale}/login?returnTo=/${locale}/teacher/quizzes`);
  if (!hasProfile(session.user.role?.type)) redirect(`/${locale}/onboarding`);
  if (!canCreateContent(session.user.role?.type)) notFound();

  const accessToken =
    wasSessionRefreshed(session) ? session.tokens.accessToken : cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;

  const result = accessToken
    ? await createQuizManageClient().listOwn(accessToken)
    : ({ ok: false as const, error: "UNAUTHORIZED", data: [] } as never);

  const isAdmin = canReviewTeachers(session.user.role?.type);
  const languages = isAdmin ? [...TARGET_LANGUAGES] : resolveLanguages(session.user.teachingLanguages);

  return (
    <TeacherQuizzesPanel
      dict={dict}
      locale={locale as Locale}
      languages={languages}
      initialQuizzes={result.ok ? result.data : []}
      initialFailed={!result.ok}
      dashboardHref={`/${locale}/dashboard`}
    />
  );
}

function resolveLanguages(value: unknown): TargetLanguage[] {
  const list = Array.isArray(value) ? value : [];
  return TARGET_LANGUAGES.filter((language) => list.includes(language));
}
