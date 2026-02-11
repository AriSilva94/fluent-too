import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, locales, type Locale } from "@/lib/i18n";

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

  const dict = await getDictionary(locale);
  return {
    title: dict.metadata.home.title,
    description: dict.metadata.home.description,
  };
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
    <>
      <Header locale={locale as Locale} dict={dict} />
      <main className="min-h-screen">{children}</main>
      <Footer locale={locale as Locale} dict={dict} />
    </>
  );
}
