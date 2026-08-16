import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import ResendConfirmationForm from "./ResendConfirmationForm";

export default async function EmailConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const { email } = await searchParams;
  return <ResendConfirmationForm dict={dict} email={email} />;
}
