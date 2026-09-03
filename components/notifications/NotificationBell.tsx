"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { NOTIFICATION_KIND, type NotificationItem, type NotificationKind } from "@/lib/notifications/client";
import { interpolate, relativeTime } from "@/lib/notifications/format";
import { getFeedState, loadFeed, markFeedSeen, subscribeToFeed, type FeedState } from "@/lib/notifications/store";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Labels = Dictionary["notifications"];

const ICONS: Record<NotificationKind, LucideIcon> = {
  [NOTIFICATION_KIND.teacherApplication]: UserRoundCheck,
  [NOTIFICATION_KIND.newStudent]: GraduationCap,
  [NOTIFICATION_KIND.newTeacher]: BadgeCheck,
  [NOTIFICATION_KIND.quizAttempt]: ClipboardCheck,
  [NOTIFICATION_KIND.applicationDecision]: CircleCheck,
  [NOTIFICATION_KIND.newQuiz]: Sparkles,
};

const TONES: Record<NotificationKind, string> = {
  [NOTIFICATION_KIND.teacherApplication]: "bg-amber-50 text-amber-700",
  [NOTIFICATION_KIND.newStudent]: "bg-sky-50 text-sky-700",
  [NOTIFICATION_KIND.newTeacher]: "bg-emerald-50 text-emerald-700",
  [NOTIFICATION_KIND.quizAttempt]: "bg-indigo-50 text-indigo-700",
  [NOTIFICATION_KIND.applicationDecision]: "bg-violet-50 text-violet-700",
  [NOTIFICATION_KIND.newQuiz]: "bg-orange-50 text-orange-700",
};

const REJECTED_TONE = "bg-rose-50 text-rose-700";
const FALLBACK_TONE = "bg-neutral-100 text-neutral-700";

function messageKey(item: NotificationItem) {
  if (item.kind !== NOTIFICATION_KIND.applicationDecision) return item.kind;
  return item.data.status === "rejected" ? "application_decision_rejected" : "application_decision_approved";
}

export function itemCopy(item: NotificationItem, labels: Labels) {
  const key = messageKey(item);
  return {
    title: interpolate(labels.kinds[key] ?? "", item.data),
    detail: interpolate(labels.details[key] ?? "", item.data),
  };
}

export default function NotificationBell({ locale, labels, className }: { locale: Locale; labels: Labels; className?: string }) {
  const [state, setState] = useState<FeedState>(getFeedState);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToFeed(setState);
    loadFeed();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === KEY.escape) setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const { feed, status } = state;
  const unread = feed.unreadCount;

  function toggle() {
    setOpen((previous) => {
      if (!previous) loadFeed({ force: true });
      return !previous;
    });
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread > 0 ? `${labels.label} (${unread})` : labels.label}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-orange"
      >
        <Bell aria-hidden className="h-5 w-5" strokeWidth={2.2} />
        {unread > 0 ? (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-brand-orange" />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={labels.label}
          className="fixed left-4 right-4 top-[72px] z-30 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[21rem]"
        >
          <div className="flex items-baseline justify-between gap-3 border-b border-neutral-200 px-4 py-3">
            <p className="text-sm font-black text-neutral-900">{labels.label}</p>
            {unread > 0 ? (
              <p className="text-xs font-bold text-brand-blue-ink">
                {unread === 1 ? labels.unreadOne : interpolate(labels.unread, { count: unread })}
              </p>
            ) : null}
          </div>

          {status === "error" && feed.items.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-semibold text-neutral-600">{labels.loadError}</p>
              <button
                type="button"
                onClick={() => loadFeed({ force: true })}
                className="mt-3 rounded-lg px-3 py-1.5 text-sm font-bold text-brand-orange transition-colors hover:bg-orange-50"
              >
                {labels.retry}
              </button>
            </div>
          ) : null}

          {status !== "error" && feed.items.length === 0 ? (
            <div className="px-4 py-7 text-center">
              <p className="text-sm font-black text-neutral-900">{labels.empty}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-neutral-500">{labels.emptyHint}</p>
            </div>
          ) : null}

          {feed.items.length > 0 ? (
            <ul className="max-h-[min(24rem,60dvh)] divide-y divide-neutral-100 overflow-y-auto [scrollbar-color:#d4d4d4_transparent] [scrollbar-width:thin]">
              {feed.items.map((item) => (
                <li key={item.id}>
                  <NotificationRow item={item} labels={labels} locale={locale} onNavigate={() => setOpen(false)} />
                </li>
              ))}
            </ul>
          ) : null}

          {unread > 0 ? (
            <div className="border-t border-neutral-200 p-1.5">
              <button
                type="button"
                onClick={() => markFeedSeen()}
                className="w-full rounded-lg px-2.5 py-2 text-sm font-bold text-brand-blue-ink transition-colors hover:bg-[#f5f8ff]"
              >
                {labels.markAll}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({
  item,
  labels,
  locale,
  onNavigate,
}: {
  item: NotificationItem;
  labels: Labels;
  locale: Locale;
  onNavigate: () => void;
}) {
  const { title, detail } = itemCopy(item, labels);
  const rejected = item.kind === NOTIFICATION_KIND.applicationDecision && item.data.status === "rejected";
  const Icon = rejected ? CircleX : ICONS[item.kind] ?? Bell;
  const tone = rejected ? REJECTED_TONE : TONES[item.kind] ?? FALLBACK_TONE;

  const body = (
    <>
      <span className={cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg", tone)}>
        <Icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className={cn("min-w-0 flex-1 text-sm leading-5", item.read ? "font-semibold text-neutral-600" : "font-black text-neutral-900")}>
            {title}
          </span>
          <span className="flex-shrink-0 text-[11px] font-bold tabular-nums text-neutral-400">
            {relativeTime(item.createdAt, locale, { justNow: labels.justNow })}
          </span>
        </span>
        {detail ? <span className="mt-0.5 block text-xs font-semibold text-neutral-500">{detail}</span> : null}
      </span>
      {item.read ? null : <span aria-hidden className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-orange" />}
    </>
  );

  const rowClass = "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f7f9fc]";

  if (!item.href) return <div className={rowClass}>{body}</div>;

  return (
    <Link href={`/${locale}${item.href}`} onClick={onNavigate} className={rowClass}>
      {body}
    </Link>
  );
}
