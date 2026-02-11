import { notFound } from "next/navigation";
import Hero from "@/components/home/Hero";
import Newsletter from "@/components/home/Newsletter";
import BlogSection from "@/components/home/BlogSection";
import QuizSection from "@/components/home/QuizSection";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <Hero dict={dict} />
      <Newsletter dict={dict} />
      <QuizSection locale={locale as Locale} dict={dict} />
      <BlogSection locale={locale as Locale} dict={dict} />
    </>
  );
}
