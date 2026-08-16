import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { resolveSession } from "@/lib/auth/session";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
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

  if (session.status === "anonymous") redirect(`/${locale}/login?returnTo=/${locale}/dashboard/security`);

  return <ChangePasswordForm dict={dict} email={session.user.email} />;
}
