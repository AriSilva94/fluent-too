"use client";

import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";
import { getSession, loadSession, subscribeToSession, type SessionState } from "@/lib/auth/session-store";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function HeaderNotifications({
  locale,
  labels,
  className,
}: {
  locale: Locale;
  labels: Dictionary["notifications"];
  className?: string;
}) {
  const [user, setUser] = useState<SessionState>(getSession);

  useEffect(() => {
    const unsubscribe = subscribeToSession(setUser);
    loadSession();
    return unsubscribe;
  }, []);

  if (!user) return null;

  return <NotificationBell locale={locale} labels={labels} className={className} />;
}
