"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/getDictionary";
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
import { QUIZ_LEVEL, QUIZ_TYPE, TARGET_LANGUAGE, type QuizLevel, type QuizType } from "@/lib/quizzes/types";

export const LANGUAGE_LABELS: Record<TargetLanguage, string> = { pt: "Português", en: "English", fr: "Français" };

type FormState = {
  title: string;
  description: string;
  targetLanguage: TargetLanguage;
  level: QuizLevel;
  type: QuizType;
  estimatedMinutes: string;
  isPublic: boolean;
  questions: QuestionDraft[];
};

export default function QuizEditorForm({
  dict,
  languages,
  quiz,
  onCancel,
  onSaved,
}: {
  dict: Dictionary;
  languages: TargetLanguage[];
  quiz: ManagedQuiz | null;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => createInitialState(quiz, languages));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const typeLabels: Record<QuizType, string> = {
    [QUIZ_TYPE.multipleChoice]: dict.teacher.typeMultipleChoice,
    [QUIZ_TYPE.fillGap]: dict.teacher.typeFillGap,
    [QUIZ_TYPE.flashcard]: dict.teacher.typeFlashcard,
  };

  function updateForm(patch: Partial<FormState>) {
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

  async function save() {
    const incomplete = form.questions.findIndex((question) => !isQuestionDraftComplete(form.type, question));
    if (incomplete >= 0) {
      setError(`${dict.teacher.errors.INVALID_QUESTION} (${dict.teacher.questionNumber} ${incomplete + 1})`);
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
    <form
      className="mt-6 space-y-6 rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-6 py-5 text-base font-semibold text-red-700 ring-1 ring-red-200">
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
            className={inputClass}
          />
        </Field>

        <Field label={dict.teacher.fieldLanguage}>
          <select
            value={form.targetLanguage}
            onChange={(event) => updateForm({ targetLanguage: event.target.value as TargetLanguage })}
            className={inputClass}
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
            className={inputClass}
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
            onChange={(event) =>
              updateForm({ type: event.target.value as QuizType, questions: [createEmptyQuestion(newQuestionId())] })
            }
            className={inputClass}
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
            className={inputClass}
          />
        </Field>

        <Field label={dict.teacher.fieldDescription}>
          <textarea
            rows={3}
            maxLength={1000}
            value={form.description}
            onChange={(event) => updateForm({ description: event.target.value })}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm font-semibold text-gray-800">
        <input
          type="checkbox"
          checked={form.isPublic}
          onChange={(event) => updateForm({ isPublic: event.target.checked })}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        />
        <span>
          {dict.teacher.fieldPublic}
          <span className="mt-1 block text-sm font-medium text-gray-500">{dict.teacher.fieldPublicHint}</span>
        </span>
      </label>

      <fieldset className="space-y-4 border-t border-gray-100 pt-6">
        <legend className="text-lg font-black text-brand-blue">{dict.teacher.questions}</legend>

        {form.questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-brand-blue">
                {dict.teacher.questionNumber} {index + 1}
              </p>
              {form.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    updateForm({ questions: form.questions.filter((_, position) => position !== index) })
                  }
                  className={linkButtonClass}
                >
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
                    className={inputClass}
                  />
                </Field>

                <FieldGroup id={`options-${question.id}`} label={dict.teacher.options}>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
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
                        className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                        className={inputClass}
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
                    className={inputClass}
                  />
                </Field>
                <Field label={dict.teacher.cardBack}>
                  <input
                    type="text"
                    value={question.back}
                    onChange={(event) => updateQuestion(index, { back: event.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            updateForm({ questions: [...form.questions, createEmptyQuestion(newQuestionId(form.questions.length))] })
          }
          className={secondaryButtonClass}
        >
          {dict.teacher.addQuestion}
        </button>
      </fieldset>

      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? dict.teacher.saving : dict.teacher.save}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={secondaryButtonClass}>
          {dict.teacher.cancel}
        </button>
      </div>
    </form>
  );
}

function createInitialState(quiz: ManagedQuiz | null, languages: TargetLanguage[]): FormState {
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
    estimatedMinutes: "",
    isPublic: quiz.isPublic !== false,
    questions: saved.length
      ? saved.map((question, index) => toQuestionDraft(type, question, newQuestionId(index)))
      : [createEmptyQuestion(newQuestionId())],
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-brand-blue">{label}</span>
      {hint && <span className="mt-1 block text-sm font-medium text-gray-500">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function FieldGroup({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <p id={id} className="text-sm font-black text-brand-blue">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="mt-2 space-y-2">
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue";

const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-orange px-6 text-base font-black text-white transition-colors hover:bg-brand-orange/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";

const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-brand-blue ring-1 ring-brand-blue/20 transition-colors hover:bg-brand-blue/5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";

const linkButtonClass =
  "text-sm font-black text-brand-blue underline decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue";

function newQuestionId(seed = 0) {
  return `q-${Date.now().toString(36)}-${seed}-${Math.random().toString(36).slice(2, 7)}`;
}
