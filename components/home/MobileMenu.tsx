"use client";

import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import LanguageSwitcher from "@/components/home/LanguageSwitcher";
import { KEY } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const MOBILE_MENU_ID = "mobile-menu-panel";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { hash: string; href: string; label: string }[];
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => void;
  locale: Locale;
  labels: { title: string; language: string };
  authSlot?: React.ReactNode;
}

const PANEL_LEAD_MS = 140;
const ROW_STEP_MS = 55;

export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  scrollToSection,
  locale,
  labels,
  authSlot,
}: MobileMenuProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === KEY.escape) onClose();
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(() => firstLinkRef.current?.focus(), PANEL_LEAD_MS + ROW_STEP_MS);

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    scrollToSection(e, hash);
    onClose();
  };

  const rowMotion = cn(
    "transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
    isOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
  );

  const rowDelay = (index: number) => ({
    transitionDelay: isOpen ? `${PANEL_LEAD_MS + index * ROW_STEP_MS}ms` : "0ms",
  });

  const footerIndex = navLinks.length + 1;

  return (
    <div className={cn("fixed inset-0 z-40 lg:hidden", !isOpen && "pointer-events-none")} inert={!isOpen}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 h-full w-full cursor-default bg-neutral-950/50 backdrop-blur-[3px]",
          "transition-opacity duration-[420ms] ease-out motion-reduce:transition-none",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        id={MOBILE_MENU_ID}
        role="dialog"
        aria-modal={isOpen || undefined}
        aria-label={labels.title}
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(87vw,22rem)] flex-col overflow-y-auto",
          "rounded-l-[28px] bg-brand-orange bg-[radial-gradient(120%_60%_at_100%_0%,rgba(255,255,255,0.22),transparent_60%)]",
          "shadow-[-24px_0_60px_rgba(15,23,42,0.35)]",
          "transition-transform duration-[520ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex min-h-full flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(5.75rem,calc(env(safe-area-inset-top)+5.25rem))]">
          <div className="flex flex-1 flex-col justify-center pb-10">
            <p
              style={rowDelay(0)}
              className={cn("mb-4 text-[11px] font-black uppercase tracking-[0.22em] text-white/55", rowMotion)}
            >
              {labels.title}
            </p>

            <nav aria-label={labels.title}>
              <ul className="-mx-3 space-y-1">
                {navLinks.map((link, index) => (
                  <li key={link.hash} className={rowMotion} style={rowDelay(index + 1)}>
                    <a
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      onClick={(e) => handleClick(e, link.hash)}
                      className="group relative flex items-center justify-between gap-3 rounded-2xl px-3 py-3.5 text-[1.45rem] font-bold leading-tight text-white/90 transition-colors duration-200 hover:bg-white/15 hover:text-white focus-visible:bg-white/15 focus-visible:text-white focus-visible:outline-none"
                    >
                      <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />
                      {link.label}
                      <ChevronRight
                        aria-hidden
                        strokeWidth={2.5}
                        className="h-5 w-5 -translate-x-1 text-white/70 opacity-0 transition-[transform,opacity] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <div className={rowMotion} style={rowDelay(footerIndex)}>
              <p className="mb-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-white/55">
                {labels.language}
              </p>
              <LanguageSwitcher locale={locale} variant="sheet" />
            </div>

            {authSlot ? (
              <div
                style={rowDelay(footerIndex + 1)}
                className={cn("mt-6 border-t border-white/20 pt-6", rowMotion)}
              >
                {authSlot}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
