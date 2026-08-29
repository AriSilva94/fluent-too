import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";
import { canReviewTeachers, hasProfile } from "@/lib/auth/roles";
import { createTeacherApplicationsClient } from "@/lib/teacher-applications/client";
import TeacherApplicationsPanel from "./TeacherApplicationsPanel";

const teachersDescriptions: Record<Locale, string> = {
  "pt-br": "Aprovação de candidaturas de professores na Fluent Too.",
  "en-us": "Teacher application approvals on Fluent Too.",
  "fr-fr": "Approbation des candidatures d'enseignants sur Fluent Too.",
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
    pathname: "/admin/teachers",
    title: `${dict.admin.teachersTitle} | Fluent Too`,
    description: teachersDescriptions[locale],
    index: false,
  });
}

export default async function AdminTeachersPage({
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

  if (session.status !== "authenticated" && session.status !== "refreshed") {
    redirect(`/${locale}/login`);
  }
  if (!hasProfile(session.user.role?.type)) redirect(`/${locale}/onboarding`);
  if (!canReviewTeachers(session.user.role?.type)) notFound();

  const accessToken = session.status === "refreshed" ? session.tokens.accessToken : cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;
  const result = accessToken
    ? await createTeacherApplicationsClient().list(accessToken, "pending")
    : ({ ok: false, error: "UNKNOWN_ERROR" } as const);

  return (
    <TeacherApplicationsPanel
      dict={dict}
      initialApplications={result.ok ? result.data : []}
      initialFailed={!result.ok}
      initialStatus="pending"
    />
  );
}
