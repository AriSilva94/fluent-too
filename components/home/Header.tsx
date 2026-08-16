"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import AuthStatus from "@/components/auth/AuthStatus";
import LanguageSwitcher from "@/components/home/LanguageSwitcher";
import MobileMenu from "@/components/home/MobileMenu";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/getDictionary";
import { assetUrl } from "@/lib/cdnAssets";
import { buildHomeAnchorHref, shouldHandleHomeAnchorScroll } from "./headerNavigation";

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { hash: "#inicio", href: buildHomeAnchorHref(locale, "#inicio"), label: dict.nav.home },
    { hash: "#recursos", href: buildHomeAnchorHref(locale, "#recursos"), label: dict.nav.resources },
    { hash: "#blog", href: buildHomeAnchorHref(locale, "#blog"), label: dict.nav.blog },
    { hash: "#contato", href: buildHomeAnchorHref(locale, "#contato"), label: dict.nav.contact },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (!shouldHandleHomeAnchorScroll(pathname, locale)) return;
    e.preventDefault();
    const id = hash.replace("#", "");

    if (id === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - headerOffset, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-orange shadow-md transition-all">
      <Container className="flex items-center justify-between py-2 md:py-4">
        <Link href={`/${locale}`} className="flex-shrink-0">
          <Image
            src={assetUrl("assets/images/LOGOTIPO-TOPO.webp")}
            alt="Fluent Too Logo"
            width={200}
            height={73}
            className="h-auto w-[130px] brightness-0 invert md:w-[200px]"
            priority
          />
        </Link>

        <nav aria-label={dict.nav.mainMenu} className="hidden items-center gap-6 lg:flex">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.hash}>
                <a
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.hash)}
                  className="cursor-pointer text-[16px] font-medium text-white transition-colors hover:text-white/80"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="ml-4 border-l pl-4 border-white/30">
            <LanguageSwitcher locale={locale} variant="header" />
          </div>
          <AuthStatus
            locale={locale}
            labels={{ login: dict.login.submit, dashboard: dict.dashboard.title, logout: dict.auth.logout }}
          />
        </nav>

        <div className="flex items-center gap-4 lg:hidden">
          <LanguageSwitcher locale={locale} variant="header" />
          <button
            type="button"
            className="z-50 flex h-10 w-10 items-center justify-center text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? dict.nav.menuClose : dict.nav.menuOpen}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={navLinks}
        scrollToSection={scrollToSection}
        authSlot={
          <AuthStatus
            locale={locale}
            labels={{ login: dict.login.submit, dashboard: dict.dashboard.title, logout: dict.auth.logout }}
          />
        }
      />
    </header>
  );
}
