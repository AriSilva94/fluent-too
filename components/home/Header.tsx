"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Container from "@/components/ui/Container";
import AuthStatus, { AUTH_LAYOUT } from "@/components/auth/AuthStatus";
import HeaderNotifications from "@/components/notifications/HeaderNotifications";
import LanguageSwitcher from "@/components/home/LanguageSwitcher";
import MobileMenu, { MOBILE_MENU_ID } from "@/components/home/MobileMenu";
import MenuToggle from "@/components/home/MenuToggle";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/getDictionary";
import { assetUrl } from "@/lib/cdnAssets";
import { buildHomeAnchorHref, shouldHandleHomeAnchorScroll } from "./headerNavigation";

export const HOME_ANCHOR = {
  home: "#inicio",
  resources: "#recursos",
  blog: "#blog",
  contact: "#contato",
} as const;

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { hash: HOME_ANCHOR.home, href: buildHomeAnchorHref(locale, HOME_ANCHOR.home), label: dict.nav.home },
    { hash: HOME_ANCHOR.resources, href: buildHomeAnchorHref(locale, HOME_ANCHOR.resources), label: dict.nav.resources },
    { hash: HOME_ANCHOR.blog, href: buildHomeAnchorHref(locale, HOME_ANCHOR.blog), label: dict.nav.blog },
    { hash: HOME_ANCHOR.contact, href: buildHomeAnchorHref(locale, HOME_ANCHOR.contact), label: dict.nav.contact },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (!shouldHandleHomeAnchorScroll(pathname, locale)) return;
    e.preventDefault();
    const id = hash.replace("#", "");

    if (hash === HOME_ANCHOR.home) {
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
          <AuthStatus locale={locale} dict={dict} />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <HeaderNotifications locale={locale} labels={dict.notifications} />
          <MenuToggle
            isOpen={menuOpen}
            onToggle={() => setMenuOpen((open) => !open)}
            labelOpen={dict.nav.menuOpen}
            labelClose={dict.nav.menuClose}
            controls={MOBILE_MENU_ID}
          />
        </div>
      </Container>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={navLinks}
        scrollToSection={scrollToSection}
        locale={locale}
        labels={{ title: dict.nav.mainMenu, language: dict.nav.language }}
        authSlot={<AuthStatus locale={locale} dict={dict} showBell={false} layout={AUTH_LAYOUT.sheet} />}
      />
    </header>
  );
}
