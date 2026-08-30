"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SessionUser = {
  email: string;
  username?: string;
};

type AuthStatusProps = {
  locale: Locale;
  labels: {
    login: string;
    dashboard: string;
    logout: string;
  };
  navigate?: (url: string) => void;
};

export default function AuthStatus({ locale, labels, navigate = (url) => window.location.assign(url) }: AuthStatusProps) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((body) => {
        if (active) setUser(body.ok && body.user ? body.user : null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function logout() {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    navigate(`/${locale}/login`);
  }

  if (user === undefined) return <span className="h-9 w-9" aria-hidden="true" />;

  if (!user) {
    return (
      <Link href={`/${locale}/login`} className="text-sm font-medium text-white transition-colors hover:text-white/80">
        {labels.login}
      </Link>
    );
  }

  const displayName = user.username || user.email;
  const initials = getInitials(displayName);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label={displayName}
        className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 py-1 pl-1 pr-3 text-white transition-colors hover:bg-white/25"
      >
        <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
          {initials}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={cn("h-3.5 w-3.5 opacity-85 transition-transform", menuOpen && "rotate-180")}
        >
          <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {menuOpen ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-10 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-2.5 border-b border-neutral-200 px-4 py-3">
            <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-neutral-900">{displayName}</span>
          </div>

          <div className="grid gap-0.5 p-1.5">
            <Link
              href={`/${locale}/dashboard`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#f5f8ff]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0 opacity-70">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              {labels.dashboard}
            </Link>

            <div className="mx-1.5 my-1 h-px bg-neutral-200" />

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {labels.logout}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getInitials(value: string) {
  const namePart = value.split("@")[0];
  const segments = namePart.split(/[.\s_-]+/).filter(Boolean);
  const initials = segments.length > 1 ? segments[0][0] + segments[1][0] : namePart.slice(0, 2);
  return initials.toUpperCase();
}
