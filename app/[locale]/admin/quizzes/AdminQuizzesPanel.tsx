"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import QuizEditorForm from "@/components/quiz/QuizEditorForm";
import QuizTable from "@/components/quiz/QuizTable";
import { rowActionClass, rowDangerActionClass } from "@/components/ui/DataTable";
import StudyLanguageFilter from "@/components/StudyLanguageFilter";
import {
  STUDY_LANGUAGE,
  buildStudyLanguageLabels,
  toTargetLanguage,
} from "@/lib/study-language";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { TARGET_LANGUAGES, type TargetLanguage } from "@/lib/quizzes/manage";
import {
  MODERATION_ACTION,
  type ManagedQuiz,
} from "@/lib/quizzes/manage-client";
import { QUIZ_TYPE, type QuizType } from "@/lib/quizzes/types";

export default function AdminQuizzesPanel({
  dict,
  locale,
  initialQuizzes,
  initialFailed,
  adminHref,
}: {
  dict: Dictionary;
  locale: Locale;
  initialQuizzes: ManagedQuiz[];
  initialFailed: boolean;
  adminHref: string;
}) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [listFailed, setListFailed] = useState(initialFailed);
  const [language, setLanguage] = useState<TargetLanguage | "">("");
  const [editing, setEditing] = useState<ManagedQuiz | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ManagedQuiz | null>(null);

  const typeLabels: Record<QuizType, string> = {
    [QUIZ_TYPE.multipleChoice]: dict.teacher.typeMultipleChoice,
    [QUIZ_TYPE.fillGap]: dict.teacher.typeFillGap,
    [QUIZ_TYPE.flashcard]: dict.teacher.typeFlashcard,
  };

  async function loadQuizzes(nextLanguage: TargetLanguage | "") {
    const query = nextLanguage ? `?targetLanguage=${nextLanguage}` : "";
    const response = await fetch(`/api/admin/quizzes${query}`);
    const body = await response.json().catch(() => ({ ok: false }));

    if (!response.ok || !body.ok) {
      setListFailed(true);
      return;
    }

    setListFailed(false);
    setQuizzes(Array.isArray(body.data) ? body.data : []);
  }

  async function selectLanguage(next: TargetLanguage | "") {
    setLanguage(next);
    await loadQuizzes(next);
  }

  async function moderate(quiz: ManagedQuiz, publish: boolean) {
    setPending(quiz.documentId);
    setError("");
    setSuccess("");

    const response = await fetch(
      `/api/admin/quizzes/${quiz.documentId}/${publish ? MODERATION_ACTION.publish : MODERATION_ACTION.unpublish}`,
      {
        method: "POST",
      },
    );
    const body = await response
      .json()
      .catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));
    setPending(null);

    if (!body.ok) {
      setError(dict.admin.moderationError);
      return;
    }

    await loadQuizzes(language);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setPending(deleteTarget.documentId);
    const response = await fetch(`/api/quizzes/${deleteTarget.documentId}`, {
      method: "DELETE",
    });
    const body = await response
      .json()
      .catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));
    setPending(null);
    setDeleteTarget(null);

    if (!body.ok) {
      setError(
        dict.teacher.errors[body.error] ?? dict.teacher.errors.UNKNOWN_ERROR,
      );
      return;
    }

    await loadQuizzes(language);
    router.refresh();
  }

  async function handleSaved() {
    setEditing(null);
    setSuccess(dict.teacher.saved);
    await loadQuizzes(language);
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: dict.admin.title, href: adminHref },
            { label: dict.admin.quizzesTitle },
          ]}
        />

        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="p-5 sm:p-6">
            <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
              {dict.admin.quizzesTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-base font-semibold leading-6 text-white/90">
              {dict.admin.quizzesSubtitle}
            </p>
          </div>
        </section>

        {success && (
          <p
            role="status"
            className="mt-6 rounded-2xl bg-emerald-50 px-6 py-5 text-base font-semibold text-emerald-800 ring-1 ring-emerald-200"
          >
            {success}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl bg-red-50 px-6 py-5 text-base font-semibold text-red-700 ring-1 ring-red-200"
          >
            {error}
          </p>
        )}

        {editing ? (
          <QuizEditorForm
            dict={dict}
            locale={locale}
            languages={[...TARGET_LANGUAGES]}
            quiz={editing}
            onCancel={() => setEditing(null)}
            onSaved={handleSaved}
          />
        ) : (
          <>
            <div className="mt-6 flex justify-center">
              <StudyLanguageFilter
                value={language === "" ? STUDY_LANGUAGE.all : language}
                labels={buildStudyLanguageLabels({
                  legend: dict.admin.filterLanguageLegend,
                  all: dict.studyLanguage.all,
                })}
                persist={false}
                hideLegend
                onChange={(next) =>
                  void selectLanguage(toTargetLanguage(next) ?? "")
                }
              />
            </div>

            <section className="mt-6">
              {listFailed ? (
                <p
                  role="alert"
                  className="rounded-2xl bg-red-50 px-6 py-8 text-base font-semibold text-red-700 ring-1 ring-red-200"
                >
                  {dict.admin.quizzesLoadError}
                </p>
              ) : quizzes.length === 0 ? (
                <p className="rounded-2xl bg-white px-6 py-8 text-base font-semibold text-gray-600 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
                  {dict.admin.quizzesEmpty}
                </p>
              ) : (
                <QuizTable
                  quizzes={quizzes}
                  dict={dict}
                  typeLabels={typeLabels}
                  extraChrome={72}
                  actions={(quiz) => (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(quiz)}
                        className={rowActionClass}
                      >
                        {dict.admin.edit}
                      </button>
                      <button
                        type="button"
                        disabled={pending === quiz.documentId}
                        onClick={() => void moderate(quiz, !quiz.publishedAt)}
                        className={rowActionClass}
                      >
                        {quiz.publishedAt
                          ? dict.admin.unpublish
                          : dict.admin.publish}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(quiz)}
                        className={rowDangerActionClass}
                      >
                        {dict.admin.delete}
                      </button>
                    </>
                  )}
                />
              )}
            </section>
          </>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-admin-quiz-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2
                id="delete-admin-quiz-title"
                className="text-2xl font-black text-gray-950"
              >
                {dict.teacher.deleteConfirmTitle}
              </h2>
              <p className="mt-3 text-base font-semibold text-gray-600">
                {dict.teacher.deleteConfirmText}
              </p>
              <p className="mt-2 text-base font-black text-brand-blue">
                {deleteTarget.title}
              </p>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className={secondaryButtonClass}
                >
                  {dict.teacher.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDelete()}
                  className={dangerButtonClass}
                >
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
