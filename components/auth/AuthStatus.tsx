"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LayoutDashboard, LogOut, ShieldCheck, SquarePen } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { APP_ROLES, type AppRole } from "@/lib/auth/contracts";
import { canCreateContent, canManageContent } from "@/lib/auth/roles";
import { resetFeed } from "@/lib/notifications/store";
import { clearSession, getSession, loadSession, subscribeToSession, type SessionUser } from "@/lib/auth/session-store";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AuthStatusProps = {
  locale: Locale;
  dict: Dictionary;
  showBell?: boolean;
  navigate?: (url: string) => void;
};

const ROLE_LABEL_KEY: Record<AppRole, keyof Dictionary["account"]> = {
  [APP_ROLES.superAdmin]: "roleSuperAdmin",
  [APP_ROLES.appAdmin]: "roleAdmin",
  [APP_ROLES.teacher]: "roleTeacher",
  [APP_ROLES.teacherPending]: "roleTeacherPending",
  [APP_ROLES.student]: "roleStudent",
  [APP_ROLES.unassigned]: "roleUnassigned",
};

export default function AuthStatus({ locale, dict, showBell = true, navigate = (url) => window.location.assign(url) }: AuthStatusProps) {
  const [user, setUser] = useState<SessionUser | null | undefined>(getSession);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSession(setUser);
    loadSession();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === KEY.escape) setMenuOpen(false);
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
    clearSession();
    resetFeed();
    navigate(`/${locale}/login`);
  }

  if (user === undefined) return <span className="h-10 w-10" aria-hidden="true" />;

  if (!user) {
    return (
      <Link href={`/${locale}/login`} className="text-sm font-medium text-white transition-colors hover:text-white/80">
        {dict.login.submit}
      </Link>
    );
  }

  const displayName = user.username || user.email;
  const role = user.role?.type;
  const roleLabel = role ? dict.account[ROLE_LABEL_KEY[role]] : null;
  const initials = getInitials(displayName);

  const links = [
    { href: `/${locale}/dashboard`, label: dict.dashboard.title, icon: LayoutDashboard, show: true },
    { href: `/${locale}/teacher/quizzes`, label: dict.teacher.title, icon: SquarePen, show: canCreateContent(role) },
    { href: `/${locale}/admin`, label: dict.admin.title, icon: ShieldCheck, show: canManageContent(role) },
    { href: `/${locale}/dashboard/security`, label: dict.account.security, icon: KeyRound, show: true },
  ].filter((link) => link.show);

  return (
    <div className="flex items-center gap-2">
      {showBell ? <NotificationBell locale={locale} labels={dict.notifications} /> : null}

      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label={displayName}
          className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 py-1 pl-1 pr-2 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-orange"
        >
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">
            {initials}
          </span>
          <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 opacity-85 transition-transform", menuOpen && "rotate-180")} strokeWidth={2.5} />
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-[#f9fbff] px-4 py-3.5">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
                {initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-neutral-900">{displayName}</span>
                {user.username && user.username !== user.email ? (
                  <span className="block truncate text-xs font-semibold text-neutral-500">{user.email}</span>
                ) : null}
                {roleLabel ? (
                  <span className="mt-1.5 inline-flex rounded-md bg-brand-blue/10 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-brand-blue-ink">
                    {roleLabel}
                  </span>
                ) : null}
              </span>
            </div>

            <div className="grid gap-0.5 p-1.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#f5f8ff]"
                >
                  <link.icon aria-hidden className="h-4 w-4 flex-shrink-0 text-neutral-400" strokeWidth={2.2} />
                  {link.label}
                </Link>
              ))}

              <div className="mx-1.5 my-1 h-px bg-neutral-200" />

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut aria-hidden className="h-4 w-4 flex-shrink-0" strokeWidth={2.2} />
                {dict.auth.logout}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getInitials(value: string) {
  const namePart = value.split("@")[0];
  const segments = namePart.split(/[.\s_-]+/).filter(Boolean);
  const initials = segments.length > 1 ? segments[0][0] + segments[1][0] : namePart.slice(0, 2);
  return initials.toUpperCase();
}
