"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Field, FieldGroup, fieldControlClass } from "@/components/ui/Field";
import { QUIZ_LEVELS, QUIZ_TYPES, type TargetLanguage } from "@/lib/quizzes/manage";
import type { ManagedQuiz } from "@/lib/quizzes/manage-client";
import {
  countGaps,
  createEmptyQuestion,
  isQuestionDraftComplete,
  syncGapAnswers,
  toQuestionDraft,
  toQuestionPayload,
  type QuestionDraft,
} from "@/lib/quizzes/editor";
import type { QuizDraft } from "@/lib/quizzes/preview";
import { QUIZ_LEVEL, QUIZ_TYPE, TARGET_LANGUAGE, type QuizLevel, type QuizType } from "@/lib/quizzes/types";
import QuizPreviewPanel from "./QuizPreviewPanel";

export const LANGUAGE_LABELS: Record<TargetLanguage, string> = { pt: "Português", en: "English", fr: "Français" };

const PANE = { edit: "edit", preview: "preview" } as const;

type Pane = (typeof PANE)[keyof typeof PANE];

export default function QuizEditorForm({
  dict,
  locale,
  languages,
  quiz,
  onCancel,
  onSaved,
}: {
  dict: Dictionary;
  locale: Locale;
  languages: TargetLanguage[];
  quiz: ManagedQuiz | null;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<QuizDraft>(() => createInitialState(quiz, languages));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pane, setPane] = useState<Pane>(PANE.edit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const typeLabels: Record<QuizType, string> = {
    [QUIZ_TYPE.multipleChoice]: dict.teacher.typeMultipleChoice,
    [QUIZ_TYPE.fillGap]: dict.teacher.typeFillGap,
    [QUIZ_TYPE.flashcard]: dict.teacher.typeFlashcard,
  };

  function updateForm(patch: Partial<QuizDraft>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function updateQuestion(index: number, patch: Partial<QuestionDraft>) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, position) =>
        position === index ? { ...question, ...patch } : question
      ),
    }));
  }

  function updateSentence(index: number, sentence: string) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, position) =>
        position === index
          ? { ...question, sentence, correctAnswers: syncGapAnswers(question.correctAnswers, countGaps(sentence)) }
          : question
      ),
    }));
  }

  function removeQuestion(index: number) {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((_, position) => position !== index),
    }));
    setActiveIndex((current) => (current === null ? null : Math.max(0, current > index ? current - 1 : current)));
  }

  function addQuestion() {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, createEmptyQuestion(newQuestionId(current.questions.length))],
    }));
    setActiveIndex(form.questions.length);
  }

  async function save() {
    const incomplete = form.questions.findIndex((question) => !isQuestionDraftComplete(form.type, question));
    if (incomplete >= 0) {
      setError(`${dict.teacher.errors.INVALID_QUESTION} (${dict.teacher.questionNumber} ${incomplete + 1})`);
      setActiveIndex(incomplete);
      setPane(PANE.edit);
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      targetLanguage: form.targetLanguage,
      level: form.level,
      type: form.type,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      isPublic: form.isPublic,
      questions: form.questions.map((question) => toQuestionPayload(form.type, question)),
    };

    const response = await fetch(quiz ? `/api/quizzes/${quiz.documentId}` : "/api/quizzes", {
      method: quiz ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({ ok: false, error: "UNKNOWN_ERROR" }));

    setSaving(false);

    if (!body.ok) {
      setError(dict.teacher.errors[body.error] ?? dict.teacher.errors.UNKNOWN_ERROR);
      return;
    }

    await onSaved();
  }

  return (
    <div className="mt-6">
      <div role="tablist" aria-label={dict.teacher.previewTitle} className="flex gap-2 lg:hidden">
        {[PANE.edit, PANE.preview].map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={pane === value}
            onClick={() => setPane(value)}
            className={cn(
              "min-h-11 flex-1 rounded-lg px-4 text-sm font-bold transition-colors",
              pane === value
                ? "bg-neutral-900 text-white"
                : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
            )}
          >
            {value === PANE.edit ? dict.teacher.tabEdit : dict.teacher.tabPreview}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-8 lg:mt-0 lg:grid-cols-12">
        <form
          className={cn("space-y-6 lg:col-span-7 lg:block", pane === PANE.edit ? "block" : "hidden")}
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={dict.teacher.fieldTitle}>
              <input
                type="text"
                required
                maxLength={120}
                value={form.title}
                onChange={(event) => updateForm({ title: event.target.value })}
                className={fieldControlClass}
              />
            </Field>

            <Field label={dict.teacher.fieldLanguage}>
              <select
                value={form.targetLanguage}
                onChange={(event) => updateForm({ targetLanguage: event.target.value as TargetLanguage })}
                className={fieldControlClass}
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {LANGUAGE_LABELS[language]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={dict.teacher.fieldLevel}>
              <select
                value={form.level}
                onChange={(event) => updateForm({ level: event.target.value as QuizLevel })}
                className={fieldControlClass}
              >
                {QUIZ_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={dict.teacher.fieldType}>
              <select
                value={form.type}
                onChange={(event) => {
                  setActiveIndex(null);
                  updateForm({
                    type: event.target.value as QuizType,
                    questions: [createEmptyQuestion(newQuestionId())],
                  });
                }}
                className={fieldControlClass}
              >
                {QUIZ_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={dict.teacher.fieldMinutes}>
              <input
                type="number"
                min={1}
                value={form.estimatedMinutes}
                onChange={(event) => updateForm({ estimatedMinutes: event.target.value })}
                className={fieldControlClass}
              />
            </Field>

            <Field label={dict.teacher.fieldDescription}>
              <textarea
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(event) => updateForm({ description: event.target.value })}
                className={fieldControlClass}
              />
            </Field>
          </div>

          <label className="flex items-start gap-3 text-sm font-semibold text-neutral-800">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(event) => updateForm({ isPublic: event.target.checked })}
              className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <span>
              {dict.teacher.fieldPublic}
              <span className="mt-1 block text-sm font-normal text-neutral-500">{dict.teacher.fieldPublicHint}</span>
            </span>
          </label>

          <fieldset className="space-y-4 border-t border-neutral-200 pt-6">
            <legend className="text-lg font-bold text-neutral-900">{dict.teacher.questions}</legend>

            {form.questions.map((question, index) => (
              <div
                key={question.id}
                onFocusCapture={() => setActiveIndex(index)}
                className={cn(
                  "rounded-lg border bg-white p-5 transition-colors",
                  activeIndex === index ? "border-blue-500 ring-1 ring-blue-500" : "border-neutral-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-neutral-900">
                    {dict.teacher.questionNumber} {index + 1}
                  </p>
                  {form.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(index)} className={linkButtonClass}>
                      {dict.teacher.removeQuestion}
                    </button>
                  )}
                </div>

                {form.type === QUIZ_TYPE.multipleChoice && (
                  <div className="mt-4 space-y-4">
                    <Field label={dict.teacher.questionText}>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(event) => updateQuestion(index, { question: event.target.value })}
                        className={fieldControlClass}
                      />
                    </Field>

                    <FieldGroup id={`options-${question.id}`} label={dict.teacher.options}>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            aria-label={`${dict.teacher.options} ${optionIndex + 1}`}
                            value={option}
                            onChange={(event) => {
                              const options = question.options.map((current, position) =>
                                position === optionIndex ? event.target.value : current
                              );
                              updateQuestion(index, { options });
                            }}
                            className={fieldControlClass}
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                updateQuestion(index, {
                                  options: question.options.filter((_, position) => position !== optionIndex),
                                })
                              }
                              className={linkButtonClass}
                            >
                              {dict.teacher.removeOption}
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateQuestion(index, { options: [...question.options, ""] })}
                        className={linkButtonClass}
                      >
                        {dict.teacher.addOption}
                      </button>
                    </FieldGroup>

                    <Field label={dict.teacher.correctAnswer}>
                      <select
                        value={question.correctAnswer}
                        onChange={(event) => updateQuestion(index, { correctAnswer: event.target.value })}
                        className={fieldControlClass}
                      >
                        <option value="">—</option>
                        {question.options
                          .map((option) => option.trim())
                          .filter(Boolean)
                          .map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                      </select>
                    </Field>
                  </div>
                )}

                {form.type === QUIZ_TYPE.fillGap && (
                  <div className="mt-4 space-y-4">
                    <Field label={dict.teacher.gapParts} hint={dict.teacher.gapPartsHint}>
                      <input
                        type="text"
                        value={question.sentence}
                        onChange={(event) => updateSentence(index, event.target.value)}
                        className={fieldControlClass}
                      />
                    </Field>

                    {question.correctAnswers.length > 0 && (
                      <FieldGroup id={`gaps-${question.id}`} label={dict.teacher.gapAnswers}>
                        {question.correctAnswers.map((answer, answerIndex) => (
                          <input
                            key={answerIndex}
                            type="text"
                            aria-label={`${dict.teacher.gapAnswers} ${answerIndex + 1}`}
                            value={answer}
                            onChange={(event) => {
                              const correctAnswers = question.correctAnswers.map((current, position) =>
                                position === answerIndex ? event.target.value : current
                              );
                              updateQuestion(index, { correctAnswers });
                            }}
                            className={fieldControlClass}
                          />
                        ))}
                      </FieldGroup>
                    )}
                  </div>
                )}

                {form.type === QUIZ_TYPE.flashcard && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label={dict.teacher.cardFront}>
                      <input
                        type="text"
                        value={question.front}
                        onChange={(event) => updateQuestion(index, { front: event.target.value })}
                        className={fieldControlClass}
                      />
                    </Field>
                    <Field label={dict.teacher.cardBack}>
                      <input
                        type="text"
                        value={question.back}
                        onChange={(event) => updateQuestion(index, { back: event.target.value })}
                        className={fieldControlClass}
                      />
                    </Field>
                  </div>
                )}
              </div>
            ))}

            <button type="button" onClick={addQuestion} className={addQuestionClass}>
              {dict.teacher.addQuestion}
            </button>
          </fieldset>

          <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
            <Button type="submit" disabled={saving}>
              {saving ? dict.teacher.saving : dict.teacher.save}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              {dict.teacher.cancel}
            </Button>
          </div>
        </form>

        <aside className={cn("lg:col-span-5 lg:block", pane === PANE.preview ? "block" : "hidden")}>
          <div className="lg:sticky lg:top-8">
            <QuizPreviewPanel draft={form} dict={dict} locale={locale} focusIndex={activeIndex ?? 0} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function createInitialState(quiz: ManagedQuiz | null, languages: TargetLanguage[]): QuizDraft {
  const fallbackLanguage = languages[0] ?? TARGET_LANGUAGE.pt;

  if (!quiz) {
    return {
      title: "",
      description: "",
      targetLanguage: fallbackLanguage,
      level: QUIZ_LEVEL.a1,
      type: QUIZ_TYPE.multipleChoice,
      estimatedMinutes: "",
      isPublic: true,
      questions: [createEmptyQuestion(newQuestionId())],
    };
  }

  const type = (QUIZ_TYPES.includes(quiz.type as QuizType) ? quiz.type : QUIZ_TYPE.multipleChoice) as QuizType;
  const saved = Array.isArray(quiz.questions) ? quiz.questions : [];

  return {
    title: quiz.title ?? "",
    description: quiz.description ?? "",
    targetLanguage: (languages.includes(quiz.targetLanguage as TargetLanguage)
      ? quiz.targetLanguage
      : fallbackLanguage) as TargetLanguage,
    level: (QUIZ_LEVELS.includes(quiz.level as QuizLevel) ? quiz.level : QUIZ_LEVEL.a1) as QuizLevel,
    type,
    estimatedMinutes: quiz.estimatedMinutes ? String(quiz.estimatedMinutes) : "",
    isPublic: quiz.isPublic !== false,
    questions: saved.length
      ? saved.map((question, index) => toQuestionDraft(type, question, newQuestionId(index)))
      : [createEmptyQuestion(newQuestionId())],
  };
}

const linkButtonClass =
  "shrink-0 text-sm font-bold text-blue-700 underline decoration-2 underline-offset-4 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

const addQuestionClass =
  "inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white px-5 text-sm font-bold text-neutral-700 transition-colors hover:border-blue-500 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

function newQuestionId(seed = 0) {
  return `q-${Date.now().toString(36)}-${seed}-${Math.random().toString(36).slice(2, 7)}`;
}
