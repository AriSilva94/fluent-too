"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import QuizEditorForm from "@/components/quiz/QuizEditorForm";
import QuizTable from "@/components/quiz/QuizTable";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import type { ManagedQuiz } from "@/lib/quizzes/manage-client";
import type { TargetLanguage } from "@/lib/quizzes/manage";
import { QUIZ_TYPE, type QuizType } from "@/lib/quizzes/types";

type EditorState = { quiz: ManagedQuiz | null } | null;

export default function TeacherQuizzesPanel({
  dict,
  locale,
  languages,
  initialQuizzes,
  initialFailed,
  dashboardHref,
}: {
  dict: Dictionary;
  locale: Locale;
  languages: TargetLanguage[];
  initialQuizzes: ManagedQuiz[];
  initialFailed: boolean;
  dashboardHref: string;
}) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [listFailed, setListFailed] = useState(initialFailed);
  const [editor, setEditor] = useState<EditorState>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ManagedQuiz | null>(null);
  const [deleting, setDeleting] = useState(false);

  const typeLabels: Record<QuizType, string> = {
    [QUIZ_TYPE.multipleChoice]: dict.teacher.typeMultipleChoice,
    [QUIZ_TYPE.fillGap]: dict.teacher.typeFillGap,
    [QUIZ_TYPE.flashcard]: dict.teacher.typeFlashcard,
  };

  const hasLanguages = languages.length > 0;

  function openEditor(quiz: ManagedQuiz | null) {
    setError("");
    setSuccess("");
    setEditor({ quiz });
  }

  async function reloadQuizzes() {
    const response = await fetch("/api/quizzes");
    const body = await response.json().catch(() => ({ ok: false }));

    if (!response.ok || !body.ok) {
      setListFailed(true);
      return;
    }

    setListFailed(false);
    setQuizzes(Array.isArray(body.data) ? body.data : []);
  }

  async function handleSaved() {
    setEditor(null);
    setSuccess(dict.teacher.saved);
    await reloadQuizzes();
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    const response = await fetch(`/api/quizzes/${deleteTarget.documentId}`, { method: "DELETE" });
    const body = await response.json().catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));
    setDeleting(false);
    setDeleteTarget(null);

    if (!body.ok) {
      setError(dict.teacher.errors[body.error] ?? dict.teacher.errors.UNKNOWN_ERROR);
      return;
    }

    await reloadQuizzes();
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Breadcrumbs items={[{ label: dict.dashboard.title, href: dashboardHref }, { label: dict.teacher.title }]} />

        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">{dict.teacher.title}</h1>
              <p className="mt-2 max-w-2xl text-base font-semibold leading-6 text-white/90">{dict.teacher.subtitle}</p>
            </div>
            {hasLanguages && !editor && (
              <button
                type="button"
                onClick={() => openEditor(null)}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-6 text-base font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue"
              >
                {dict.teacher.newQuiz}
              </button>
            )}
          </div>
        </section>

        {!hasLanguages && (
          <p role="alert" className="mt-6 rounded-2xl bg-amber-50 px-6 py-8 text-base font-semibold text-amber-800 ring-1 ring-amber-200">
            {dict.teacher.noLanguages}
          </p>
        )}

        {success && (
          <p role="status" className="mt-6 rounded-2xl bg-emerald-50 px-6 py-5 text-base font-semibold text-emerald-800 ring-1 ring-emerald-200">
            {success}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-6 py-5 text-base font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}

        {editor ? (
          <QuizEditorForm
            dict={dict}
            locale={locale}
            languages={languages}
            quiz={editor.quiz}
            onCancel={() => setEditor(null)}
            onSaved={handleSaved}
          />
        ) : (
          <section className="mt-6">
            {listFailed ? (
              <p role="alert" className="rounded-2xl bg-red-50 px-6 py-8 text-base font-semibold text-red-700 ring-1 ring-red-200">
                {dict.teacher.loadError}
              </p>
            ) : quizzes.length === 0 ? (
              <p className="rounded-2xl bg-white px-6 py-8 text-base font-semibold text-gray-600 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
                {dict.teacher.empty}
              </p>
            ) : (
              <QuizTable
                quizzes={quizzes}
                dict={dict}
                typeLabels={typeLabels}
                actions={(quiz) => (
                  <>
                    <button type="button" onClick={() => openEditor(quiz)} className={secondaryButtonClass}>
                      {dict.teacher.editQuiz}
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(quiz)} className={dangerButtonClass}>
                      {dict.teacher.delete}
                    </button>
                  </>
                )}
              />
            )}
          </section>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="delete-quiz-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <h2 id="delete-quiz-title" className="text-2xl font-black text-gray-950">
                {dict.teacher.deleteConfirmTitle}
              </h2>
              <p className="mt-3 text-base font-semibold text-gray-600">{dict.teacher.deleteConfirmText}</p>
              <p className="mt-2 text-base font-black text-brand-blue">{deleteTarget.title}</p>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} className={secondaryButtonClass}>
                  {dict.teacher.cancel}
                </button>
                <button type="button" onClick={() => void confirmDelete()} disabled={deleting} className={dangerButtonClass}>
                  {dict.teacher.deleteConfirmCta}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-brand-blue ring-1 ring-brand-blue/20 transition-colors hover:bg-brand-blue/5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";

const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-red-50 px-5 text-sm font-black text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";
