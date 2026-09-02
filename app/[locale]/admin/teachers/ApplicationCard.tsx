"use client";

import type { ReactNode } from "react";
import { CircleCheck, CircleX, FileText, Link2 } from "lucide-react";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import LanguageFlag from "@/components/ui/LanguageFlag";
import { isHttpUrl } from "@/lib/auth/teacher-registration";
import { APPLICATION_STATUS, type TeacherApplicationStatus } from "@/lib/teacher-applications/client";
import { buildDecisionLine } from "@/lib/teacher-applications/review-meta";

export type ApplicationUser = {
  id: number;
  username?: string | null;
  email: string;
  confirmed?: boolean;
};

export type TeacherApplication = {
  id: number;
  status: TeacherApplicationStatus;
  languages?: string[] | null;
  bio?: string | null;
  experience?: string | null;
  credentialUrl?: string | null;
  attachment?: { id: number; url: string; name?: string | null } | null;
  user?: ApplicationUser | null;
  reviewedBy?: ApplicationUser | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
};

const STATUS_TONES: Record<TeacherApplicationStatus, string> = {
  [APPLICATION_STATUS.pending]: "bg-amber-50 text-amber-800 ring-amber-600/20",
  [APPLICATION_STATUS.approved]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  [APPLICATION_STATUS.rejected]: "bg-red-50 text-red-700 ring-red-600/20",
};

export default function ApplicationCard({
  application,
  dict,
  locale,
  error,
  actions,
  className,
}: {
  application: TeacherApplication;
  dict: Dictionary;
  locale: Locale;
  error?: string;
  actions?: ReactNode;
  className?: string;
}) {
  const statusLabels: Record<TeacherApplicationStatus, string> = {
    [APPLICATION_STATUS.pending]: dict.admin.teachersStatusPending,
    [APPLICATION_STATUS.approved]: dict.admin.teachersStatusApproved,
    [APPLICATION_STATUS.rejected]: dict.admin.teachersStatusRejected,
  };

  const decided = application.status !== APPLICATION_STATUS.pending;
  const approved = application.status === APPLICATION_STATUS.approved;
  const languages = application.languages ?? [];
  const username = application.user?.username?.trim();
  const showUsername = Boolean(username) && username !== application.user?.email;

  const decisionLine = decided
    ? buildDecisionLine({
        reviewer: application.reviewedBy,
        reviewedAt: application.reviewedAt,
        locale,
        byTemplate: dict.admin.teachersDecidedBy,
        unknownReviewer: dict.admin.teachersReviewerUnknown,
      })
    : null;

  return (
    <article className={cn("overflow-hidden rounded-2xl bg-white shadow-[0_18px_54px_rgba(65,132,249,0.12)]", className)}>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 p-5">
        <div className="min-w-0">
          <p className="truncate text-base font-black text-neutral-900">
            {application.user?.email ?? dict.admin.teachersNoUser}
          </p>
          {showUsername && <p className="mt-0.5 truncate text-sm font-medium text-neutral-500">{username}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {languages.map((language) => (
            <LanguageFlag
              key={language}
              language={language}
              label={language.toUpperCase()}
              className="text-sm font-bold text-neutral-600"
            />
          ))}
          <span
            className={cn(
              "inline-flex rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
              STATUS_TONES[application.status]
            )}
          >
            {statusLabels[application.status]}
          </span>
        </div>
      </header>

      {decided && (
        <p
          className={cn(
            "flex flex-wrap items-center gap-2 px-5 py-3 text-sm font-semibold",
            approved ? "bg-emerald-50/70 text-emerald-800" : "bg-red-50/70 text-red-800"
          )}
        >
          {approved ? (
            <CircleCheck aria-hidden className="h-4 w-4 shrink-0" />
          ) : (
            <CircleX aria-hidden className="h-4 w-4 shrink-0" />
          )}
          <span className="font-black">{statusLabels[application.status]}</span>
          <span className="font-medium">{decisionLine}</span>
        </p>
      )}

      {(application.bio || application.experience) && (
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          {application.bio && <DetailBlock label={dict.auth.teacherBioLabel}>{application.bio}</DetailBlock>}
          {application.experience && (
            <DetailBlock label={dict.auth.teacherExperienceLabel}>{application.experience}</DetailBlock>
          )}
        </div>
      )}

      {(application.attachment?.url || (application.credentialUrl && isHttpUrl(application.credentialUrl))) && (
        <div className="flex flex-wrap gap-2 px-5 pb-5">
          {application.credentialUrl && isHttpUrl(application.credentialUrl) && (
            <ResourceLink href={application.credentialUrl} icon={Link2} label={dict.admin.teachersCredentialLabel} />
          )}
          {application.attachment?.url && (
            <ResourceLink
              href={application.attachment.url}
              icon={FileText}
              label={application.attachment.name ?? dict.admin.teachersAttachmentLabel}
            />
          )}
        </div>
      )}

      {application.status === APPLICATION_STATUS.rejected && application.reviewNote && (
        <div className="mx-5 mb-5 rounded-lg bg-red-50 p-4 ring-1 ring-red-200">
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            {dict.admin.teachersRejectNoteLabel}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-6 text-red-900">{application.reviewNote}</p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mx-5 mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200"
        >
          {error}
        </p>
      )}

      {actions && <div className="flex flex-wrap items-start gap-3 border-t border-neutral-100 p-5">{actions}</div>}
    </article>
  );
}

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1.5 text-sm font-medium leading-6 text-neutral-700">{children}</p>
    </div>
  );
}

function ResourceLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Link2;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-9 max-w-full items-center gap-2 rounded-lg bg-neutral-50 px-3 text-sm font-bold text-brand-blue ring-1 ring-neutral-200 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
    >
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}
