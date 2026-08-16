"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

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
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((body) => {
        if (active) setAuthenticated(Boolean(body.ok && body.user));
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    navigate(`/${locale}/login`);
  }

  if (authenticated === null) return <span className="h-9 w-20" aria-hidden="true" />;

  if (!authenticated) {
    return (
      <Link href={`/${locale}/login`} className="text-sm font-medium text-white transition-colors hover:text-white/80">
        {labels.login}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/${locale}/dashboard`} className="text-sm font-medium text-white transition-colors hover:text-white/80">
        {labels.dashboard}
      </Link>
      <button type="button" onClick={logout} className="text-sm font-medium text-white transition-colors hover:text-white/80">
        {labels.logout}
      </button>
    </div>
  );
}
