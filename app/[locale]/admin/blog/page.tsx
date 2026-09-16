import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { canManageContent, hasProfile } from "@/lib/auth/roles";
import { createBlogManageClient } from "@/lib/blog/manage-client";
import AdminBlogPanel from "./AdminBlogPanel";

const descriptions: Record<Locale, string> = {
  "pt-br": "Gestão dos artigos do blog da Fluent Too.",
  "en-us": "Fluent Too blog article management.",
  "fr-fr": "Gestion des articles du blog Fluent Too.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/admin/blog",
    title: `${dict.admin.blogTitle} | Fluent Too`,
    description: descriptions[locale],
    index: false,
  });
}

export default async function AdminBlogPage({ params }: { params: Promise<{ locale: string }> }) {
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

  if (isAnonymousSession(session)) redirect(`/${locale}/login?returnTo=/${locale}/admin/blog`);
  if (!hasProfile(session.user.role?.type)) redirect(`/${locale}/onboarding`);
  if (!canManageContent(session.user.role?.type)) notFound();

  const accessToken =
    wasSessionRefreshed(session) ? session.tokens.accessToken : cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;

  const result = accessToken
    ? await createBlogManageClient().list(accessToken)
    : ({ ok: false as const, error: "UNAUTHORIZED", status: 401 } as never);

  return (
    <AdminBlogPanel
      dict={dict}
      initialPosts={result.ok ? result.data : []}
      initialFailed={!result.ok}
      defaultAuthor={session.user.username ?? session.user.email}
      adminHref={`/${locale}/admin`}
    />
  );
}
