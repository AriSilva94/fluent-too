import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalPage from "@/components/legal/LegalPage";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { getLegalDocument } from "@/lib/legal/documents";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const document = getLegalDocument(locale, "privacy");
  return buildPageMetadata({
    locale,
    pathname: "/privacy",
    title: `${document.title} | Fluent Too`,
    description: document.summary,
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  return <LegalPage document={getLegalDocument(locale as Locale, "privacy")} dict={dict} locale={locale as Locale} />;
}
