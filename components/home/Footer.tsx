"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/getDictionary";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer role="contentinfo" className="bg-brand-orange text-white py-6 relative">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left: Copyright */}
        <p className="text-sm font-medium order-2 md:order-1">
          {dict.footer.copyright.replace("{year}", "")}
        </p>

        {/* Center: Logo */}
        <div className="order-1 md:order-2">
          <Link href={`/${locale}`} className="flex items-center justify-center">
            <Image
              src="/assets/img/LOGOTIPO-TOPO.png"
              alt="Fluent Too Logo"
              width={200}
              height={73}
              className="h-auto w-[150px] brightness-0 invert"
            />
          </Link>
        </div>

        {/* Right: Social Icons */}
        <div className="flex items-center gap-6 order-3">
          {/* Facebook */}
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
            </svg>
          </a>

          {/* Instagram */}
          <a href="#" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
        </div>
      </Container>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute bottom-0 right-8 bg-brand-blue text-white p-2 rounded-t-md hover:bg-blue-600 transition-colors"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </footer>
  );
}
