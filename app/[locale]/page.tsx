import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Hero from "@/components/home/Hero";
import Newsletter from "@/components/home/Newsletter";
import BlogSection from "@/components/home/BlogSection";
import QuizSection from "@/components/home/QuizSection";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata, getLocalizedUrl, getSiteName } from "@/lib/seo";

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
    title: dict.metadata.home.title,
    description: dict.metadata.home.description,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: getSiteName(),
    url: getLocalizedUrl(locale as Locale),
    inLanguage: locale,
    description: dict.metadata.home.description,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero dict={dict} />
      <Newsletter dict={dict} />
      <QuizSection locale={locale as Locale} dict={dict} />
      <BlogSection locale={locale as Locale} dict={dict} />
    </>
  );
}
