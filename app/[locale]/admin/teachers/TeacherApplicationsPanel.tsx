"use client";

import { useState } from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import PagedPanel from "@/components/ui/PagedPanel";
import ApplicationsTable from "./ApplicationsTable";
import ApplicationCard, { type TeacherApplication } from "./ApplicationCard";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { APPLICATION_STATUS, REVIEW_ACTION, REVIEW_ERROR, type ReviewAction, type TeacherApplicationStatus } from "@/lib/teacher-applications/client";
import { valuesOf } from "@/lib/enums";

type ApplicationStatus = TeacherApplicationStatus;

const STATUS_FILTERS: ApplicationStatus[] = valuesOf(APPLICATION_STATUS);

const VIEW_MODE = { table: "table", grid: "grid" } as const;

type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

const VIEW_MODES: ViewMode[] = [VIEW_MODE.table, VIEW_MODE.grid];

const GRID_PAGE_SIZE = 6;

const FILTERS_CHROME = 68;
type ReviewDialogState = { applicationId: number; action: ReviewAction } | null;

export default function TeacherApplicationsPanel({
  dict,
  locale,
  initialApplications,
  initialFailed = false,
  initialStatus,
  dashboardHref,
}: {
  dict: Dictionary;
  locale: Locale;
  initialApplications: unknown[];
  initialFailed?: boolean;
  initialStatus: ApplicationStatus;
  dashboardHref: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [view, setView] = useState<ViewMode>(VIEW_MODE.table);
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

  async function decide(id: number, action: ReviewAction, reviewNote?: string) {
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
        body.error === REVIEW_ERROR.alreadyReviewed
          ? dict.admin.teachersAlreadyReviewed
          : body.error === REVIEW_ERROR.reviewNoteRequired
            ? dict.admin.teachersRejectNoteRequired
            : dict.admin.teachersReviewError;
      setErrors((current) => ({ ...current, [id]: message }));
      return;
    }

    closeReviewDialog();
    router.refresh();
    await loadApplications(status);
  }

  function openReviewDialog(applicationId: number, action: ReviewAction) {
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

    if (reviewDialog.action === REVIEW_ACTION.reject) {
      const note = rejectNote.trim();
      if (!note) {
        setDialogError(dict.admin.teachersRejectNoteRequired);
        return;
      }
      void decide(reviewDialog.applicationId, REVIEW_ACTION.reject, note);
      return;
    }

    void decide(reviewDialog.applicationId, REVIEW_ACTION.approve);
  }

  function startReject(id: number) {
    openReviewDialog(id, REVIEW_ACTION.reject);
    setErrors((current) => ({ ...current, [id]: "" }));
  }

  function reviewActions(application: TeacherApplication) {
    if (application.status !== APPLICATION_STATUS.pending) return null;

    return (
      <>
        <button
          type="button"
          onClick={() => openReviewDialog(application.id, REVIEW_ACTION.approve)}
          disabled={pendingAction === application.id}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-blue px-5 text-sm font-black text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9 sm:px-4 sm:text-xs"
        >
          {dict.admin.teachersApprove}
        </button>

        <button
          type="button"
          onClick={() => startReject(application.id)}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-brand-orange ring-1 ring-brand-orange/40 transition-colors hover:bg-brand-orange/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 sm:min-h-9 sm:px-4 sm:text-xs"
        >
          {dict.admin.teachersReject}
        </button>
      </>
    );
  }

  const selectedApplication = reviewDialog
    ? applications.find((application) => application.id === reviewDialog.applicationId)
    : null;
  const isRejectDialog = reviewDialog?.action === REVIEW_ACTION.reject;

  return (
    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: dict.dashboard.title, href: dashboardHref },
            { label: dict.admin.teachersTitle },
          ]}
        />

        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="p-5 sm:p-6">
            <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">{dict.admin.teachersTitle}</h1>
            <p className="mt-2 max-w-2xl text-base font-semibold leading-6 text-white/90">{dict.admin.teachersSubtitle}</p>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label={dict.admin.teachersTitle}>
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => selectStatus(filter)}
                aria-pressed={status === filter}
                className={cn(
                  "min-h-11 rounded-lg px-5 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
                  status === filter
                    ? "bg-brand-orange text-white"
                    : "bg-white text-brand-blue shadow-[0_10px_30px_rgba(65,132,249,0.12)]"
                )}
              >
                {statusLabels[filter]}
              </button>
            ))}
          </div>

          <div className="flex gap-1 rounded-lg bg-white p-1 shadow-[0_10px_30px_rgba(65,132,249,0.12)]" role="group" aria-label={dict.table.viewLabel}>
            {VIEW_MODES.map((mode) => {
              const Icon = mode === VIEW_MODE.table ? Table2 : LayoutGrid;
              const label = mode === VIEW_MODE.table ? dict.table.viewTable : dict.table.viewGrid;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  aria-pressed={view === mode}
                  title={label}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
                    view === mode ? "bg-brand-blue text-white" : "text-brand-blue hover:bg-brand-blue/5"
                  )}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-6">
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

          {applications.length > 0 && view === VIEW_MODE.grid ? (
            <PagedPanel rows={applications} labels={dict.table} pageSize={GRID_PAGE_SIZE} extraChrome={FILTERS_CHROME}>
              {(pageRows) => (
                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  {pageRows.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      dict={dict}
                      locale={locale}
                      error={errors[application.id]}
                      className="shadow-none ring-1 ring-neutral-200"
                      actions={reviewActions(application)}
                    />
                  ))}
                </div>
              )}
            </PagedPanel>
          ) : null}

          {applications.length > 0 && view === VIEW_MODE.table ? (
            <ApplicationsTable
              applications={applications}
              dict={dict}
              locale={locale}
              actions={reviewActions}
              extraChrome={FILTERS_CHROME}
            />
          ) : null}
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
