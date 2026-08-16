import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  return <ForgotPasswordForm dict={dict} locale={locale as Locale} />;
}
