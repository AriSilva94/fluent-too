"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/getDictionary";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { isHttpUrl } from "@/lib/auth/teacher-registration";

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
type ReviewDialogState = { applicationId: number; action: "approve" | "reject" } | null;

export default function TeacherApplicationsPanel({
  dict,
  initialApplications,
  initialFailed = false,
  initialStatus,
  dashboardHref,
}: {
  dict: Dictionary;
  initialApplications: unknown[];
  initialFailed?: boolean;
  initialStatus: ApplicationStatus;
  dashboardHref: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [applications, setApplications] = useState<TeacherApplication[]>(initialApplications as TeacherApplication[]);
  const [listFailed, setListFailed] = useState(initialFailed);
  const [loading, setLoading] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [dialogError, setDialogError] = useState("");
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
      const body = await response.json().catch(() => ({ ok: false }));

      // Falha da API mostra estado de erro, nunca o estado vazio: os dois significam
      // coisas opostas para quem revisa a fila.
      if (!response.ok || !body.ok) {
        setListFailed(true);
        setApplications([]);
        return;
      }

      setListFailed(false);
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
            : dict.admin.teachersReviewError;
      setErrors((current) => ({ ...current, [id]: message }));
      return;
    }

    closeReviewDialog();
    router.refresh();
    await loadApplications(status);
  }

  function openReviewDialog(applicationId: number, action: "approve" | "reject") {
    setReviewDialog({ applicationId, action });
    setRejectNote("");
    setDialogError("");
    setErrors((current) => ({ ...current, [applicationId]: "" }));
  }

  function closeReviewDialog() {
    setReviewDialog(null);
    setRejectNote("");
    setDialogError("");
  }

  function confirmReviewDialog() {
    if (!reviewDialog) return;

    if (reviewDialog.action === "reject") {
      const note = rejectNote.trim();
      if (!note) {
        setDialogError(dict.admin.teachersRejectNoteRequired);
        return;
      }
      void decide(reviewDialog.applicationId, "reject", note);
      return;
    }

    void decide(reviewDialog.applicationId, "approve");
  }

  function startReject(id: number) {
    openReviewDialog(id, "reject");
    setErrors((current) => ({ ...current, [id]: "" }));
  }

  const selectedApplication = reviewDialog
    ? applications.find((application) => application.id === reviewDialog.applicationId)
    : null;
  const isRejectDialog = reviewDialog?.action === "reject";

  return (
    <div className="bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: dict.dashboard.title, href: dashboardHref },
            { label: dict.admin.teachersTitle },
          ]}
        />

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
          {!loading && listFailed ? (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-6 py-8 text-base font-semibold text-red-700 ring-1 ring-red-200"
            >
              {dict.admin.teachersLoadError}
            </p>
          ) : null}

          {!loading && !listFailed && applications.length === 0 ? (
            <p className="rounded-2xl bg-white px-6 py-8 text-base font-semibold text-neutral-600 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
              {dict.admin.teachersEmpty}
            </p>
          ) : null}

          {applications.map((application) => {
            const errorId = `application-${application.id}-error`;
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
                  {/* Os validadores já barram `javascript:` na entrada, mas candidaturas
                      gravadas antes disso ainda podem ter um link hostil: aqui é o `href`
                      que executaria na origem autenticada de quem revisa. */}
                  {application.credentialUrl && isHttpUrl(application.credentialUrl) ? (
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
                      onClick={() => openReviewDialog(application.id, "approve")}
                      disabled={pendingAction === application.id}
                      className="min-h-11 rounded-lg bg-brand-blue px-5 text-sm font-black text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {dict.admin.teachersApprove}
                    </button>

                    <button
                      type="button"
                      onClick={() => startReject(application.id)}
                      className="min-h-11 rounded-lg bg-white px-5 text-sm font-black text-brand-orange ring-1 ring-brand-orange/40 transition-colors hover:bg-brand-orange/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
                    >
                      {dict.admin.teachersReject}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        {reviewDialog && selectedApplication ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 px-4 py-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="teacher-review-dialog-title"
              aria-describedby="teacher-review-dialog-description"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_28px_90px_rgba(17,24,39,0.28)]"
            >
              <h2 id="teacher-review-dialog-title" className="text-2xl font-black leading-tight text-brand-blue">
                {isRejectDialog ? dict.admin.teachersRejectConfirmTitle : dict.admin.teachersApproveConfirmTitle}
              </h2>
              <p id="teacher-review-dialog-description" className="mt-3 text-base font-medium leading-7 text-neutral-600">
                {isRejectDialog ? dict.admin.teachersRejectConfirmText : dict.admin.teachersApproveConfirmText}
              </p>
              <p className="mt-4 break-words rounded-lg bg-[#f5f8ff] px-4 py-3 text-sm font-black text-brand-blue">
                {selectedApplication.user?.email}
              </p>

              {isRejectDialog ? (
                <div className="mt-5">
                  <label htmlFor="teacher-review-note" className="text-sm font-black text-brand-blue">
                    {dict.admin.teachersRejectNoteLabel}
                  </label>
                  <textarea
                    id="teacher-review-note"
                    rows={4}
                    value={rejectNote}
                    onChange={(event) => {
                      setRejectNote(event.target.value);
                      if (dialogError) setDialogError("");
                    }}
                    aria-invalid={Boolean(dialogError)}
                    aria-describedby={dialogError ? "teacher-review-dialog-error" : undefined}
                    className="mt-2 w-full rounded-lg border-0 bg-[#f5f8ff] px-4 py-3 text-sm font-semibold text-gray-900 caret-brand-orange ring-1 ring-brand-blue/18 transition-shadow placeholder:text-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                  {dialogError ? (
                    <p id="teacher-review-dialog-error" role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
                      {dialogError}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeReviewDialog}
                  className="min-h-11 rounded-lg bg-white px-5 text-sm font-black text-brand-blue ring-1 ring-brand-blue/25 transition-colors hover:bg-brand-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                >
                  {dict.admin.cancel}
                </button>
                <button
                  type="button"
                  onClick={confirmReviewDialog}
                  disabled={pendingAction === reviewDialog.applicationId}
                  className={`min-h-11 rounded-lg px-5 text-sm font-black text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isRejectDialog
                      ? "bg-brand-orange hover:bg-brand-orange/90 focus-visible:ring-brand-blue"
                      : "bg-brand-blue hover:bg-brand-blue/90 focus-visible:ring-brand-orange"
                  }`}
                >
                  {isRejectDialog ? dict.admin.teachersRejectConfirmCta : dict.admin.teachersApproveConfirmCta}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
