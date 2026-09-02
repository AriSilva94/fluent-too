"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { LANGUAGE_LABELS } from "@/components/quiz/QuizEditorForm";
import DataTable, { rowActionClass, rowDangerActionClass, type DataColumn } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import LanguageFlag from "@/components/ui/LanguageFlag";
import type { Dictionary } from "@/lib/getDictionary";
import type { ManagedBlogPost } from "@/lib/blog/manage-client";
import { TARGET_LANGUAGES, type TargetLanguage } from "@/lib/quizzes/manage";
import { TARGET_LANGUAGE } from "@/lib/quizzes/types";

type FormState = {
  documentId: string | null;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readingTime: string;
  targetLanguage: TargetLanguage;
};

export default function AdminBlogPanel({
  dict,
  initialPosts,
  initialFailed,
  defaultAuthor,
  adminHref,
}: {
  dict: Dictionary;
  initialPosts: ManagedBlogPost[];
  initialFailed: boolean;
  defaultAuthor: string;
  adminHref: string;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [listFailed, setListFailed] = useState(initialFailed);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ManagedBlogPost | null>(
    null,
  );

  function startNew() {
    setError("");
    setSuccess("");
    setForm({
      documentId: null,
      title: "",
      slug: "",
      category: "",
      excerpt: "",
      content: "",
      date: new Date().toISOString().slice(0, 10),
      author: defaultAuthor,
      readingTime: "",
      targetLanguage: TARGET_LANGUAGE.pt,
    });
  }

  function startEdit(post: ManagedBlogPost) {
    setError("");
    setSuccess("");
    setForm({
      documentId: post.documentId,
      title: post.title ?? "",
      slug: post.slug ?? "",
      category: post.category ?? "",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      date: normalizeDate(post.date),
      author: post.author ?? defaultAuthor,
      readingTime: post.readingTime ? String(post.readingTime) : "",
      targetLanguage: (TARGET_LANGUAGES.includes(
        post.targetLanguage as TargetLanguage,
      )
        ? post.targetLanguage
        : TARGET_LANGUAGE.pt) as TargetLanguage,
    });
  }

  function updateForm(patch: Partial<FormState>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
  }

  async function reloadPosts() {
    const response = await fetch("/api/admin/blog");
    const body = await response.json().catch(() => ({ ok: false }));

    if (!response.ok || !body.ok) {
      setListFailed(true);
      return;
    }

    setListFailed(false);
    setPosts(Array.isArray(body.data) ? body.data : []);
  }

  async function save() {
    if (!form) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      excerpt: form.excerpt,
      content: form.content,
      date: form.date,
      author: form.author,
      targetLanguage: form.targetLanguage,
      readingTime: form.readingTime ? Number(form.readingTime) : undefined,
    };

    const response = await fetch(
      form.documentId
        ? `/api/admin/blog/${form.documentId}`
        : "/api/admin/blog",
      {
        method: form.documentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await response
      .json()
      .catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));

    setSaving(false);

    if (!body.ok) {
      setError(
        dict.teacher.errors[body.error] ?? dict.teacher.errors.UNKNOWN_ERROR,
      );
      return;
    }

    setForm(null);
    setSuccess(dict.admin.blogSaved);
    await reloadPosts();
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setSaving(true);
    const response = await fetch(`/api/admin/blog/${deleteTarget.documentId}`, {
      method: "DELETE",
    });
    const body = await response
      .json()
      .catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));
    setSaving(false);
    setDeleteTarget(null);

    if (!body.ok) {
      setError(
        dict.teacher.errors[body.error] ?? dict.teacher.errors.UNKNOWN_ERROR,
      );
      return;
    }

    await reloadPosts();
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: dict.admin.title, href: adminHref },
            { label: dict.admin.blogTitle },
          ]}
        />

        <section className="overflow-hidden rounded-2xl bg-brand-blue shadow-[0_24px_80px_rgba(65,132,249,0.22)]">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                {dict.admin.blogTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-base font-semibold leading-6 text-white/90">
                {dict.admin.blogSubtitle}
              </p>
            </div>
            {!form && (
              <button
                type="button"
                onClick={startNew}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-6 text-base font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-blue"
              >
                {dict.admin.blogNew}
              </button>
            )}
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

        {form ? (
          <form
            className="mt-6 space-y-6 rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={dict.admin.blogFieldTitle}>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={form.title}
                  onChange={(event) =>
                    updateForm({ title: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label={dict.admin.blogFieldSlug}>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(event) => updateForm({ slug: event.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label={dict.admin.blogFieldCategory}>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(event) =>
                    updateForm({ category: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label={dict.admin.blogFieldLanguage}>
                <select
                  value={form.targetLanguage}
                  onChange={(event) =>
                    updateForm({
                      targetLanguage: event.target.value as TargetLanguage,
                    })
                  }
                  className={inputClass}
                >
                  {TARGET_LANGUAGES.map((language) => (
                    <option key={language} value={language}>
                      {LANGUAGE_LABELS[language]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={dict.admin.blogFieldDate}>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) => updateForm({ date: event.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label={dict.admin.blogFieldAuthor}>
                <input
                  type="text"
                  required
                  value={form.author}
                  onChange={(event) =>
                    updateForm({ author: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label={dict.admin.blogFieldReadingTime}>
                <input
                  type="number"
                  min={1}
                  value={form.readingTime}
                  onChange={(event) =>
                    updateForm({ readingTime: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label={dict.admin.blogFieldExcerpt}>
              <textarea
                rows={3}
                required
                maxLength={500}
                value={form.excerpt}
                onChange={(event) =>
                  updateForm({ excerpt: event.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label={dict.admin.blogFieldContent}>
              <textarea
                rows={14}
                required
                value={form.content}
                onChange={(event) =>
                  updateForm({ content: event.target.value })
                }
                className={inputClass}
              />
            </Field>

            <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={saving}
                className={primaryButtonClass}
              >
                {saving ? dict.admin.saving : dict.admin.save}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                disabled={saving}
                className={secondaryButtonClass}
              >
                {dict.admin.cancel}
              </button>
            </div>
          </form>
        ) : (
          <section className="mt-6">
            {listFailed ? (
              <p
                role="alert"
                className="rounded-2xl bg-red-50 px-6 py-8 text-base font-semibold text-red-700 ring-1 ring-red-200"
              >
                {dict.admin.blogLoadError}
              </p>
            ) : posts.length === 0 ? (
              <p className="rounded-2xl bg-white px-6 py-8 text-base font-semibold text-gray-600 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
                {dict.admin.blogEmpty}
              </p>
            ) : (
              <DataTable
                rows={posts}
                columns={postColumns(dict)}
                rowKey={(post) => post.documentId}
                primaryHeader={dict.admin.blogFieldTitle}
                primary={(post) => post.title}
                meta={(post) =>
                  [post.category, normalizeDate(post.date), languageLabel(post.targetLanguage)]
                    .filter(Boolean)
                    .join(" · ")
                }
                labels={dict.table}
                actions={(post) => (
                  <>
                    <button type="button" onClick={() => startEdit(post)} className={rowActionClass}>
                      {dict.admin.edit}
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(post)} className={rowDangerActionClass}>
                      {dict.admin.delete}
                    </button>
                  </>
                )}
              />
            )}
          </section>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-post-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2
                id="delete-post-title"
                className="text-2xl font-black text-gray-950"
              >
                {dict.admin.blogDeleteConfirmTitle}
              </h2>
              <p className="mt-3 text-base font-semibold text-gray-600">
                {dict.admin.blogDeleteConfirmText}
              </p>
              <p className="mt-2 text-base font-black text-brand-blue">
                {deleteTarget.title}
              </p>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={saving}
                  className={secondaryButtonClass}
                >
                  {dict.admin.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDelete()}
                  disabled={saving}
                  className={dangerButtonClass}
                >
                  {dict.admin.blogDeleteConfirmCta}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeDate(value: string | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : value;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-brand-blue">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue";

const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-6 text-base font-black text-white transition-colors hover:bg-brand-orange/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-brand-blue ring-1 ring-brand-blue/20 transition-colors hover:bg-brand-blue/5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";

const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-red-50 px-5 text-sm font-black text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

function languageLabel(value: string | undefined) {
  return LANGUAGE_LABELS[value as TargetLanguage] ?? value ?? "";
}

function postColumns(dict: Dictionary): DataColumn<ManagedBlogPost>[] {
  return [
    {
      key: "category",
      header: dict.admin.blogFieldCategory,
      cell: (post) => post.category ?? "",
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      key: "language",
      header: dict.admin.blogFieldLanguage,
      cell: (post) => <LanguageFlag language={post.targetLanguage} label={languageLabel(post.targetLanguage)} />,
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      key: "date",
      header: dict.admin.blogFieldDate,
      cell: (post) => normalizeDate(post.date),
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
    {
      key: "status",
      header: dict.table.status,
      headerClassName: "hidden sm:table-cell",
      cell: (post) => (
        <StatusBadge
          published={Boolean(post.publishedAt)}
          publishedLabel={dict.teacher.statusPublished}
          draftLabel={dict.teacher.statusDraft}
        />
      ),
    },
  ];
}
