"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronUp, Code2 } from "lucide-react";
import Container from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/getDictionary";
import { assetUrl } from "@/lib/cdnAssets";
import { legalHref } from "@/lib/legal/documents";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  },
  {
    label: "WhatsApp",
    href: "#",
    path: "M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21",
    extraPath: "M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1",
  },
  { label: "Instagram", href: "#", path: "" },
] as const;

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer role="contentinfo" className="relative bg-brand-orange py-7 text-white">
      <Container className="flex flex-col items-center gap-7 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Link href={`/${locale}`} className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-orange">
            <Image
              src={assetUrl("assets/images/LOGOTIPO-TOPO.webp")}
              alt="Fluent Too"
              width={200}
              height={73}
              className="h-auto w-[142px] brightness-0 invert"
            />
          </Link>
          <p className="text-sm font-medium text-white/85">
            {dict.footer.copyright.replace("{year}", new Date().getFullYear().toString())}
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold text-white/80">
            <Link href={legalHref(locale, "terms")} className="underline underline-offset-2 transition-colors hover:text-white">
              {dict.legal.termsShort}
            </Link>
            <span aria-hidden className="text-white/40">·</span>
            <Link href={legalHref(locale, "privacy")} className="underline underline-offset-2 transition-colors hover:text-white">
              {dict.legal.privacyShort}
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 md:items-end md:pr-12">
          <ul className="flex items-center gap-5">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-orange"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {social.label === "Instagram" ? (
                      <>
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </>
                    ) : (
                      <>
                        <path d={social.path} />
                        {"extraPath" in social ? <path d={social.extraPath} /> : null}
                      </>
                    )}
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <a
            href="https://arisilva.tech/pt-br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-orange"
          >
            <Code2 size={14} aria-hidden="true" strokeWidth={1.8} />
            <span>
              Desenvolvido por <span className="underline underline-offset-2">AriSilva.tech</span>
            </span>
          </a>
        </div>
      </Container>

      <button
        type="button"
        onClick={scrollToTop}
        className="absolute bottom-0 right-6 rounded-t-md bg-brand-blue p-2 text-white transition-colors hover:bg-brand-blue-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:right-8"
        aria-label={dict.footer.backToTop}
      >
        <ChevronUp aria-hidden className="h-5 w-5" strokeWidth={2.4} />
      </button>
    </footer>
  );
}
