"use client";

import { usePathname, useRouter } from "next/navigation";
import BR from "country-flag-icons/react/3x2/BR";
import US from "country-flag-icons/react/3x2/US";
import FR from "country-flag-icons/react/3x2/FR";
import { LOCALE, locales, localeLabels, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const SWITCHER_VARIANT = { default: "default", header: "header", sheet: "sheet" } as const;

export type SwitcherVariant = (typeof SWITCHER_VARIANT)[keyof typeof SWITCHER_VARIANT];

const localeFlags: Record<Locale, React.ComponentType<React.HTMLAttributes<HTMLElement>>> = {
  [LOCALE.ptBr]: BR,
  [LOCALE.enUs]: US,
  [LOCALE.frFr]: FR,
};

export default function LanguageSwitcher({
  locale,
  variant = SWITCHER_VARIANT.default,
}: {
  locale: Locale;
  variant?: SwitcherVariant;
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

  const isSheet = variant === SWITCHER_VARIANT.sheet;
  const onOrange = isSheet || variant === SWITCHER_VARIANT.header;

  return (
    <div className={cn("flex items-center", isSheet ? "gap-2" : "gap-1.5")}>
      {locales.map((loc) => {
        const Flag = localeFlags[loc];
        const isActive = locale === loc;

        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            title={localeLabels[loc]}
            aria-current={isActive || undefined}
            className={cn(
              "flex items-center gap-1.5 rounded text-xs font-bold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isSheet ? "min-h-11 flex-1 justify-center rounded-xl px-3 py-2.5" : "px-1.5 py-1",
              onOrange
                ? cn(
                    "focus-visible:ring-white focus-visible:ring-offset-brand-orange",
                    isActive
                      ? isSheet
                        ? "bg-white text-brand-orange shadow-[0_6px_16px_rgba(15,23,42,0.16)]"
                        : "bg-white/20 text-white"
                      : isSheet
                        ? "bg-white/12 text-white/80 hover:bg-white/20 hover:text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                  )
                : cn(
                    "focus-visible:ring-brand-orange focus-visible:ring-offset-white",
                    isActive
                      ? "bg-brand-orange text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-brand-orange"
                  )
            )}
          >
            <Flag className="h-3.5 w-5 rounded-sm object-cover" />
            <span className={cn(isSheet ? "inline" : "hidden sm:inline")}>{localeLabels[loc]}</span>
          </button>
        );
      })}
    </div>
  );
}
