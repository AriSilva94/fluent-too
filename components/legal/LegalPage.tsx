import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatBlogDate } from "@/lib/blog/format-date";
import { interpolate } from "@/lib/notifications/format";
import { LEGAL_UPDATED_AT, type LegalDocument } from "@/lib/legal/types";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function LegalPage({
  document,
  dict,
  locale,
}: {
  document: LegalDocument;
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fff7f1_60%,#eef5ff_100%)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue-ink transition-colors hover:text-brand-orange"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={2.4} />
          {dict.legal.backHome}
        </Link>

        <header className="mt-6 border-b border-brand-blue/15 pb-8">
          <h1 className="text-3xl font-black leading-tight text-brand-blue sm:text-4xl">{document.title}</h1>
          <p className="mt-4 max-w-[62ch] text-lg font-medium leading-8 text-neutral-700">{document.summary}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-neutral-500">
            {interpolate(dict.legal.updatedAt, { date: formatBlogDate(LEGAL_UPDATED_AT, locale) })}
          </p>
        </header>

        <div className="mt-10 space-y-9">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-black text-brand-blue">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="max-w-[68ch] text-base font-medium leading-7 text-neutral-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
