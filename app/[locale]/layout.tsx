import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MotionConfig } from "motion/react";
import LocaleChrome from "@/components/home/localeChrome";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, locales, type Locale } from "@/lib/i18n";
import { getDefaultMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  return getDefaultMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <MotionConfig reducedMotion="user">
      <LocaleChrome locale={locale as Locale} dict={dict}>
        {children}
      </LocaleChrome>
    </MotionConfig>
  );
}
