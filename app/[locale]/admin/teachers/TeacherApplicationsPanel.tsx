"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/getDictionary";

type ApplicationStatus = "pending" | "approved" | "rejected";

type ApplicationUser = {
  id: number;
  username?: string | null;
  email: string;
  confirmed?: boolean;
};

type ApplicationAttachment = {
  id: number;
  url: string;
  name?: string | null;
};

type TeacherApplication = {
  id: number;
  status: ApplicationStatus;
  languages?: string[] | null;
  bio?: string | null;
  experience?: string | null;
  credentialUrl?: string | null;
  attachment?: ApplicationAttachment | null;
  user?: ApplicationUser | null;
  reviewedBy?: ApplicationUser | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
};

const STATUS_FILTERS: ApplicationStatus[] = ["pending", "approved", "rejected"];

export default function TeacherApplicationsPanel({
  dict,
  initialApplications,
  initialStatus,
}: {
  dict: Dictionary;
  initialApplications: unknown[];
  initialStatus: ApplicationStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [applications, setApplications] = useState<TeacherApplication[]>(initialApplications as TeacherApplication[]);
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [pendingAction, setPendingAction] = useState<number | null>(null);

  const statusLabels: Record<ApplicationStatus, string> = {
    pending: dict.admin.teachersFilterPending,
    approved: dict.admin.teachersFilterApproved,
    rejected: dict.admin.teachersFilterRejected,
  };

  async function loadApplications(nextStatus: ApplicationStatus) {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher-applications?status=${nextStatus}`);
      const body = await response.json().catch(() => ({ data: [] }));
      setApplications(Array.isArray(body.data) ? body.data : []);
    } finally {
      setLoading(false);
    }
  }

  async function selectStatus(nextStatus: ApplicationStatus) {
    setStatus(nextStatus);
    await loadApplications(nextStatus);
  }

  async function decide(id: number, action: "approve" | "reject", reviewNote?: string) {
    setPendingAction(id);
    setErrors((current) => ({ ...current, [id]: "" }));

    const response = await fetch(`/api/teacher-applications/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewNote !== undefined ? { reviewNote } : {}),
    });
    const body = await response.json().catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));

    setPendingAction(null);

    if (!body.ok) {
      const message =
        body.error === "ALREADY_REVIEWED"
          ? dict.admin.teachersAlreadyReviewed
          : body.error === "REVIEW_NOTE_REQUIRED"
            ? dict.admin.teachersRejectNoteRequired
            : body.error;
      setErrors((current) => ({ ...current, [id]: message }));
      return;
    }

    setRejecting(null);
    setNotes((current) => ({ ...current, [id]: "" }));
    router.refresh();
    await loadApplications(status);
  }

  function startReject(id: number) {
    setRejecting(id);
    setErrors((current) => ({ ...current, [id]: "" }));
  }

  function submitReject(id: number) {
    const note = (notes[id] ?? "").trim();
    if (!note) {
      setErrors((current) => ({ ...current, [id]: dict.admin.teachersRejectNoteRequired }));
      return;
    }
    void decide(id, "reject", note);
  }

  return (
    <div className="bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="p-6 sm:p-8 lg:p-10">
            <h1 className="text-4xl font-black leading-none text-white sm:text-5xl">{dict.admin.teachersTitle}</h1>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={dict.admin.teachersTitle}>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => selectStatus(filter)}
              aria-pressed={status === filter}
              className={`min-h-11 rounded-lg px-5 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 ${
                status === filter ? "bg-brand-orange text-white" : "bg-white text-brand-blue shadow-[0_10px_30px_rgba(65,132,249,0.12)]"
              }`}
            >
              {statusLabels[filter]}
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {!loading && applications.length === 0 ? (
            <p className="rounded-2xl bg-white px-6 py-8 text-base font-semibold text-neutral-600 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
              {dict.admin.teachersEmpty}
            </p>
          ) : null}

          {applications.map((application) => {
            const errorId = `application-${application.id}-error`;
            const noteId = `application-${application.id}-note`;
            const error = errors[application.id];

            return (
              <article key={application.id} className="rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-black text-brand-orange">{application.user?.email}</p>
                    {application.languages && application.languages.length > 0 ? (
                      <p className="mt-1 text-sm font-bold text-neutral-500">{application.languages.join(", ").toUpperCase()}</p>
                    ) : null}
                  </div>
                  {application.credentialUrl ? (
                    <a
                      href={application.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-brand-blue hover:underline sm:text-right"
                    >
                      {application.credentialUrl}
                    </a>
                  ) : null}
                </div>

                {application.bio ? <p className="mt-4 text-base font-medium leading-7 text-neutral-600">{application.bio}</p> : null}
                {application.experience ? (
                  <p className="mt-2 text-base font-medium leading-7 text-neutral-600">{application.experience}</p>
                ) : null}

                {application.attachment?.url ? (
                  <a
                    href={application.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-bold text-brand-blue hover:underline"
                  >
                    {application.attachment.name ?? application.attachment.url}
                  </a>
                ) : null}

                {application.status === "rejected" && application.reviewNote ? (
                  <p className="mt-3 text-sm font-semibold text-red-700">{application.reviewNote}</p>
                ) : null}

                {error ? (
                  <p id={errorId} role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                    {error}
                  </p>
                ) : null}

                {application.status === "pending" ? (
                  <div className="mt-5 flex flex-wrap items-start gap-3">
                    <button
                      type="button"
                      onClick={() => decide(application.id, "approve")}
                      disabled={pendingAction === application.id}
                      className="min-h-11 rounded-lg bg-brand-blue px-5 text-sm font-black text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {dict.admin.teachersApprove}
                    </button>

                    {rejecting === application.id ? (
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
                        <div className="flex-1">
                          <label htmlFor={noteId} className="sr-only">
                            {dict.admin.teachersRejectNoteLabel}
                          </label>
                          <textarea
                            id={noteId}
                            rows={2}
                            value={notes[application.id] ?? ""}
                            onChange={(event) => setNotes((current) => ({ ...current, [application.id]: event.target.value }))}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? errorId : undefined}
                            placeholder={dict.admin.teachersRejectNoteLabel}
                            className="w-full min-w-[16rem] rounded-lg border-0 bg-[#f5f8ff] px-4 py-3 text-sm font-semibold text-gray-900 caret-brand-orange ring-1 ring-brand-blue/18 transition-shadow placeholder:text-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => submitReject(application.id)}
                          disabled={pendingAction === application.id}
                          className="min-h-11 shrink-0 rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {dict.admin.teachersReject}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startReject(application.id)}
                        className="min-h-11 rounded-lg bg-white px-5 text-sm font-black text-brand-orange ring-1 ring-brand-orange/40 transition-colors hover:bg-brand-orange/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
                      >
                        {dict.admin.teachersReject}
                      </button>
                    )}
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
