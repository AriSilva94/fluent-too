import { QUIZ_TYPE, type QuizType } from "./types";

export const GAP_MARKER = "___";

export type QuestionDraft = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  sentence: string;
  correctAnswers: string[];
  front: string;
  back: string;
};

export function createEmptyQuestion(seed: string): QuestionDraft {
  return {
    id: seed,
    question: "",
    options: ["", ""],
    correctAnswer: "",
    sentence: "",
    correctAnswers: [""],
    front: "",
    back: "",
  };
}

export function splitGapSentence(sentence: string): string[] {
  return sentence.split(GAP_MARKER);
}

export function joinGapParts(parts: unknown): string {
  return Array.isArray(parts) ? parts.map((part) => (typeof part === "string" ? part : "")).join(GAP_MARKER) : "";
}

export function countGaps(sentence: string) {
  return Math.max(0, splitGapSentence(sentence).length - 1);
}

export function syncGapAnswers(answers: string[], gapCount: number): string[] {
  const next = answers.slice(0, gapCount);
  while (next.length < gapCount) next.push("");
  return next;
}

export function toQuestionPayload(type: QuizType, draft: QuestionDraft): Record<string, unknown> {
  const id = draft.id.trim();

  if (type === QUIZ_TYPE.multipleChoice) {
    return {
      id,
      question: draft.question.trim(),
      options: draft.options.map((option) => option.trim()),
      correctAnswer: draft.correctAnswer.trim(),
    };
  }

  if (type === QUIZ_TYPE.fillGap) {
    return {
      id,
      parts: splitGapSentence(draft.sentence),
      correctAnswers: draft.correctAnswers.map((answer) => answer.trim()),
    };
  }

  return { id, question: draft.front.trim(), front: draft.front.trim(), back: draft.back.trim() };
}

export function toQuestionDraft(type: QuizType, raw: unknown, fallbackId: string): QuestionDraft {
  const value = (raw ?? {}) as Record<string, unknown>;
  const draft = createEmptyQuestion(readText(value.id) || fallbackId);

  if (type === QUIZ_TYPE.multipleChoice) {
    const options = Array.isArray(value.options) ? value.options.map(readText) : [];
    return {
      ...draft,
      question: readText(value.question),
      options: options.length >= 2 ? options : ["", ""],
      correctAnswer: readText(value.correctAnswer),
    };
  }

  if (type === QUIZ_TYPE.fillGap) {
    const sentence = joinGapParts(value.parts);
    const answers = Array.isArray(value.correctAnswers) ? value.correctAnswers.map(readText) : [];
    return { ...draft, sentence, correctAnswers: syncGapAnswers(answers, countGaps(sentence)) };
  }

  return { ...draft, front: readText(value.front), back: readText(value.back) };
}

export function isQuestionDraftComplete(type: QuizType, draft: QuestionDraft) {
  if (type === QUIZ_TYPE.multipleChoice) {
    const options = draft.options.map((option) => option.trim());
    if (!draft.question.trim() || options.length < 2 || options.some((option) => !option)) return false;
    if (new Set(options).size !== options.length) return false;
    return options.includes(draft.correctAnswer.trim());
  }

  if (type === QUIZ_TYPE.fillGap) {
    const gaps = countGaps(draft.sentence);
    if (gaps === 0) return false;
    const answers = draft.correctAnswers.map((answer) => answer.trim());
    return answers.length === gaps && answers.every(Boolean);
  }

  return Boolean(draft.front.trim()) && Boolean(draft.back.trim());
}

function readText(value: unknown) {
  return typeof value === "string" ? value : "";
}
