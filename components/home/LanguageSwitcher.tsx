"use client";

import { usePathname, useRouter } from "next/navigation";
import BR from "country-flag-icons/react/3x2/BR";
import US from "country-flag-icons/react/3x2/US";
import FR from "country-flag-icons/react/3x2/FR";
import { locales, localeLabels, type Locale } from "@/lib/i18n";

const localeFlags: Record<Locale, React.ComponentType<React.HTMLAttributes<HTMLElement>>> = {
  "pt-br": BR,
  "en-us": US,
  "fr-fr": FR,
};

export default function LanguageSwitcher({
  locale,
  variant = "default",
}: {
  locale: Locale;
  variant?: "default" | "header";
}) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;

    const nextPath = segments.join("/");
    const query = typeof window !== "undefined" ? window.location.search : "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const nextUrl = `${nextPath}${query}${hash}`;

    router.push(nextUrl, { scroll: false });
  }

  return (
    <div className="flex items-center gap-1.5">
      {locales.map((loc) => {
        const Flag = localeFlags[loc];
        const isHeader = variant === "header";
        const isActive = locale === loc;

        let buttonClass =
          "flex items-center gap-1 rounded px-1.5 py-1 text-xs font-bold transition-all ";

        if (isHeader) {
          buttonClass += isActive
            ? "bg-white/20 text-white"
            : "text-white/70 hover:text-white hover:bg-white/10";
        } else {
          buttonClass += isActive
            ? "bg-brand-orange text-white"
            : "text-gray-500 hover:text-brand-orange hover:bg-gray-100";
        }

        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            title={localeLabels[loc]}
            className={buttonClass}
          >
            <Flag className="h-3.5 w-5 rounded-sm object-cover" />
            <span className={`${isHeader ? "text-white" : ""} hidden sm:inline`}>{localeLabels[loc]}</span>
          </button>
        );
      })}
    </div>
  );
}
