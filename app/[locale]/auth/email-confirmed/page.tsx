import { notFound } from "next/navigation";
import AuthFeedback from "@/components/auth/AuthFeedback";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";

export default async function EmailConfirmedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <AuthFeedback
      title={dict.auth.emailConfirmedTitle}
      message={dict.auth.emailConfirmedSubtitle}
      actionHref={`/${locale}/login`}
      actionLabel={dict.auth.loginLink}
      homeHref={`/${locale}/`}
      visualTitle={dict.auth.visualTitle}
      visualText={dict.auth.visualText}
    />
  );
}
