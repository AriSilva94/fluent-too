"use client";

import { useState } from "react";
import { APPLICATION_STATUS } from "@/lib/teacher-applications/client";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/getDictionary";
import type { TeacherApplicationView } from "./teacher-application-view";

export default function TeacherApplicationStatus({
  dict,
  view,
  reviewNote,
}: {
  dict: Dictionary;
  view: TeacherApplicationView;
  reviewNote: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorId = "teacher-application-status-error";

  async function continueAsStudent() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/student", { method: "POST" });
      const body = await response.json().catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));
      if (!response.ok || !body.ok) {
        const message = typeof body.error === "string" && dict.auth.errors[body.error] ? dict.auth.errors[body.error] : dict.auth.errors.UNKNOWN_ERROR;
        setError(message);
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError(dict.auth.errors.UNKNOWN_ERROR);
      setLoading(false);
    }
  }

  if (view === APPLICATION_STATUS.rejected) {
    return (
      <section className="mb-6 rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(255,103,0,0.12)]">
        <h2 className="text-xl font-black text-brand-orange">{dict.dashboard.teacherRejectedTitle}</h2>
        <p className="mt-2 text-base font-medium leading-7 text-neutral-600">
          {reviewNote ? `${dict.dashboard.teacherRejectedText} ${reviewNote}` : dict.dashboard.teacherRejectedText}
        </p>
        {error ? (
          <p id={errorId} role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={continueAsStudent}
          disabled={loading}
          aria-describedby={error ? errorId : undefined}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {dict.dashboard.teacherRejectedCta}
        </button>
      </section>
    );
  }

  return (
    <section className="mb-6 rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(255,103,0,0.12)]">
      <h2 className="text-xl font-black text-brand-orange">{dict.dashboard.teacherPendingTitle}</h2>
      <p className="mt-2 text-base font-medium leading-7 text-neutral-600">{dict.dashboard.teacherPendingText}</p>
    </section>
  );
}
