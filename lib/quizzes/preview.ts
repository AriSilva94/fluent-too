import type { Dictionary } from "@/lib/getDictionary";
import { countGaps, splitGapSentence, type QuestionDraft } from "./editor";
import {
  QUIZ_TYPE,
  type FillGapQuestion,
  type FlashcardQuestion,
  type MultipleChoiceQuestion,
  type Quiz,
  type QuizLevel,
  type QuizType,
  type TargetLanguage,
} from "./types";

export const PREVIEW_QUIZ_ID = "preview";

export type QuizDraft = {
  title: string;
  description: string;
  targetLanguage: TargetLanguage;
  level: QuizLevel;
  type: QuizType;
  estimatedMinutes: string;
  isPublic: boolean;
  questions: QuestionDraft[];
};

export function previewSignature(draft: QuizDraft) {
  return `${draft.type}:${draft.questions.length}`;
}

export function draftToQuiz(draft: QuizDraft, dict: Dictionary): Quiz {
  const base = {
    id: PREVIEW_QUIZ_ID,
    title: draft.title.trim() || dict.teacher.previewUntitled,
    description: draft.description.trim() || dict.teacher.previewNoDescription,
    level: draft.level,
    targetLanguage: draft.targetLanguage,
  };

  if (draft.type === QUIZ_TYPE.fillGap) {
    return {
      ...base,
      type: QUIZ_TYPE.fillGap,
      questions: draft.questions.map((question, index) => toFillGapPreview(question, index, dict)),
    };
  }

  if (draft.type === QUIZ_TYPE.flashcard) {
    return {
      ...base,
      type: QUIZ_TYPE.flashcard,
      questions: draft.questions.map((question, index) => toFlashcardPreview(question, index, dict)),
    };
  }

  return {
    ...base,
    type: QUIZ_TYPE.multipleChoice,
    questions: draft.questions.map((question, index) => toMultipleChoicePreview(question, index, dict)),
  };
}

function toMultipleChoicePreview(draft: QuestionDraft, index: number, dict: Dictionary): MultipleChoiceQuestion {
  const options = draft.options.map(
    (option, position) => option.trim() || numbered(dict.teacher.previewOption, position + 1)
  );

  return {
    id: draft.id,
    question: draft.question.trim() || numbered(dict.teacher.previewQuestion, index + 1),
    options,
    correctAnswer: draft.correctAnswer.trim(),
  };
}

function toFillGapPreview(draft: QuestionDraft, index: number, dict: Dictionary): FillGapQuestion {
  const sentence = draft.sentence.trim();
  const gaps = countGaps(draft.sentence);

  if (gaps === 0) {
    return {
      id: draft.id,
      question: "",
      parts: [sentence || numbered(dict.teacher.previewSentence, index + 1), ""],
      correctAnswers: [""],
    };
  }

  return {
    id: draft.id,
    question: "",
    parts: splitGapSentence(draft.sentence),
    correctAnswers: draft.correctAnswers.map((answer) => answer.trim()),
  };
}

function toFlashcardPreview(draft: QuestionDraft, index: number, dict: Dictionary): FlashcardQuestion {
  const front = draft.front.trim() || numbered(dict.teacher.previewCardFront, index + 1);

  return {
    id: draft.id,
    question: front,
    front,
    back: draft.back.trim() || numbered(dict.teacher.previewCardBack, index + 1),
  };
}

function numbered(template: string, value: number) {
  return template.replace("{n}", String(value));
}
