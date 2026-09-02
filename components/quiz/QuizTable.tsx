"use client";

import type { ReactNode } from "react";
import { ListChecks, TextCursorInput, WalletCards, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/lib/getDictionary";
import DataTable, { type DataColumn } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import LanguageFlag from "@/components/ui/LanguageFlag";
import LevelTag from "@/components/ui/LevelTag";
import type { ManagedQuiz } from "@/lib/quizzes/manage-client";
import type { TargetLanguage } from "@/lib/quizzes/manage";
import { QUIZ_TYPE, type QuizType } from "@/lib/quizzes/types";
import { LANGUAGE_LABELS } from "./QuizEditorForm";

interface Props {
  quizzes: ManagedQuiz[];
  dict: Dictionary;
  typeLabels: Record<QuizType, string>;
  actions: (quiz: ManagedQuiz) => ReactNode;
  pageSize?: number;
  extraChrome?: number;
}

const TYPE_ICONS: Record<QuizType, LucideIcon> = {
  [QUIZ_TYPE.multipleChoice]: ListChecks,
  [QUIZ_TYPE.fillGap]: TextCursorInput,
  [QUIZ_TYPE.flashcard]: WalletCards,
};

export default function QuizTable({ quizzes, dict, typeLabels, actions, pageSize, extraChrome }: Props) {
  const language = (quiz: ManagedQuiz) =>
    LANGUAGE_LABELS[quiz.targetLanguage as TargetLanguage] ?? quiz.targetLanguage;
  const type = (quiz: ManagedQuiz) => typeLabels[quiz.type as QuizType] ?? quiz.type;

  const columns: DataColumn<ManagedQuiz>[] = [
    {
      key: "language",
      header: dict.teacher.fieldLanguage,
      cell: (quiz) => <LanguageFlag language={quiz.targetLanguage} label={language(quiz)} />,
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      key: "level",
      header: dict.teacher.fieldLevel,
      cell: (quiz) => <LevelTag level={quiz.level} />,
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
    },
    {
      key: "type",
      header: dict.teacher.fieldType,
      cell: (quiz) => {
        const Icon = TYPE_ICONS[quiz.type as QuizType];

        return (
          <span className="inline-flex items-center gap-2">
            {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0 text-neutral-500" />}
            {type(quiz)}
          </span>
        );
      },
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
    {
      key: "status",
      header: dict.table.status,
      headerClassName: "hidden sm:table-cell",
      cell: (quiz) => (
        <StatusBadge
          published={Boolean(quiz.publishedAt)}
          publishedLabel={dict.teacher.statusPublished}
          draftLabel={dict.teacher.statusDraft}
        />
      ),
    },
  ];

  return (
    <DataTable
      rows={quizzes}
      columns={columns}
      rowKey={(quiz) => quiz.documentId}
      primaryHeader={dict.teacher.fieldTitle}
      primary={(quiz) => quiz.title}
      meta={(quiz) => `${language(quiz)} · ${quiz.level} · ${type(quiz)}`}
      actions={actions}
      labels={dict.table}
      pageSize={pageSize}
      extraChrome={extraChrome}
    />
  );
}
