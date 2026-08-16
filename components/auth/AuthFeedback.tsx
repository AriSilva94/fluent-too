"use client";

import Link from "next/link";
import AuthShell from "./AuthShell";

type AuthFeedbackProps = {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
  homeHref?: string;
  visualTitle: string;
  visualText: string;
};

export default function AuthFeedback({ title, message, actionHref, actionLabel, homeHref, visualTitle, visualText }: AuthFeedbackProps) {
  return (
    <AuthShell homeHref={homeHref} visualTitle={visualTitle} visualText={visualText}>
      <div className="rounded-2xl bg-white p-7 shadow-[0_24px_80px_rgba(65,132,249,0.16)] sm:p-9">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange text-2xl font-black text-white">
          OK
        </div>
        <h1 className="text-3xl font-black leading-tight text-brand-blue sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base font-medium leading-7 text-neutral-600">{message}</p>
        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-6 text-base font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </AuthShell>
  );
}
