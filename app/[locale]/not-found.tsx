"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Container from "@/components/ui/Container";
import { defaultLocale, isValidLocale, type Locale } from "@/lib/i18n";
import ptBR from "@/messages/pt-br.json";
import enUS from "@/messages/en-us.json";
import frFR from "@/messages/fr-fr.json";

const dictionaries = {
  "pt-br": ptBR,
  "en-us": enUS,
  "fr-fr": frFR,
} as const;

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const localeParam = params?.locale;
  const locale: Locale =
    localeParam && isValidLocale(localeParam) ? localeParam : defaultLocale;
  const copy = dictionaries[locale].notFound;

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,_#fff7f1_0%,_#ffffff_55%,_#eef5ff_100%)] py-20 md:py-28">
      <div className="absolute left-0 top-12 h-36 w-36 rounded-full bg-brand-orange/12 blur-3xl" />
      <div className="absolute bottom-8 right-0 h-40 w-40 rounded-full bg-brand-blue/12 blur-3xl" />

      <Container className="relative">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-brand-orange/15 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(65,132,249,0.08)] backdrop-blur md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-orange">
            {copy.badge}
          </p>
          <p className="mt-4 text-6xl font-bold leading-none text-brand-blue md:text-8xl">
            404
          </p>
          <h1 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold leading-tight text-brand-blue md:text-5xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-text md:text-lg">
            {copy.description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}`}
              className="inline-flex min-w-52 items-center justify-center rounded-lg bg-brand-orange px-6 py-3 font-bold text-white transition-colors hover:bg-brand-orange/90"
            >
              {copy.primaryAction}
            </Link>
            <Link
              href={`/${locale}/quizzes`}
              className="inline-flex min-w-52 items-center justify-center rounded-lg border border-brand-blue/20 bg-white px-6 py-3 font-bold text-brand-blue transition-colors hover:bg-brand-blue/5"
            >
              {copy.secondaryAction}
            </Link>
          </div>

          <p className="mt-8 text-sm text-neutral-text">{copy.hint}</p>
        </div>
      </Container>
    </section>
  );
}
