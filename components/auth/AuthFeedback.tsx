"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import AuthShell from "./AuthShell";
import type { AuthVisual } from "@/lib/auth/visual";

type AuthFeedbackProps = {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  visual: AuthVisual;
};

export default function AuthFeedback({ title, message, actionHref, actionLabel, visual }: AuthFeedbackProps) {
  return (
    <AuthShell visual={visual}>
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/20">
          <CircleCheck aria-hidden className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <h1 className="mt-5 text-3xl font-black leading-tight text-brand-blue">{title}</h1>
        <p className="mt-3 text-base font-medium leading-7 text-neutral-600">{message}</p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-6 text-base font-black text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)] transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </AuthShell>
  );
}
