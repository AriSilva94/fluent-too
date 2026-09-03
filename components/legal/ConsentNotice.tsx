import Link from "next/link";
import { legalHref } from "@/lib/legal/documents";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

const TOKEN = /(\{terms\}|\{privacy\})/;

export default function ConsentNotice({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const parts = dict.auth.consent.split(TOKEN);

  return (
    <p className="text-xs font-semibold leading-5 text-neutral-500">
      {parts.map((part, index) => {
        if (part === "{terms}") {
          return (
            <Link key={index} href={legalHref(locale, "terms")} className="font-bold text-brand-blue-ink underline underline-offset-2 transition-colors hover:text-brand-orange">
              {dict.legal.termsShort}
            </Link>
          );
        }
        if (part === "{privacy}") {
          return (
            <Link key={index} href={legalHref(locale, "privacy")} className="font-bold text-brand-blue-ink underline underline-offset-2 transition-colors hover:text-brand-orange">
              {dict.legal.privacyShort}
            </Link>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}
