"use client";

import type { ReactNode } from "react";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import DataTable, { type DataColumn } from "@/components/ui/DataTable";
import LanguageFlag from "@/components/ui/LanguageFlag";
import { APPLICATION_STATUS, type TeacherApplicationStatus } from "@/lib/teacher-applications/client";
import { formatReviewDate, reviewerName } from "@/lib/teacher-applications/review-meta";
import type { TeacherApplication } from "./ApplicationCard";

const STATUS_TONES: Record<TeacherApplicationStatus, string> = {
  [APPLICATION_STATUS.pending]: "bg-amber-50 text-amber-800 ring-amber-600/20",
  [APPLICATION_STATUS.approved]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  [APPLICATION_STATUS.rejected]: "bg-red-50 text-red-700 ring-red-600/20",
};

export default function ApplicationsTable({
  applications,
  dict,
  locale,
  actions,
  extraChrome,
}: {
  applications: TeacherApplication[];
  dict: Dictionary;
  locale: Locale;
  actions: (application: TeacherApplication) => ReactNode;
  extraChrome?: number;
}) {
  const statusLabels: Record<TeacherApplicationStatus, string> = {
    [APPLICATION_STATUS.pending]: dict.admin.teachersStatusPending,
    [APPLICATION_STATUS.approved]: dict.admin.teachersStatusApproved,
    [APPLICATION_STATUS.rejected]: dict.admin.teachersStatusRejected,
  };

  const columns: DataColumn<TeacherApplication>[] = [
    {
      key: "languages",
      header: dict.admin.teachersLanguagesColumn,
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
      cell: (application) => (
        <span className="flex flex-wrap items-center gap-3">
          {(application.languages ?? []).map((language) => (
            <LanguageFlag key={language} language={language} label={language.toUpperCase()} />
          ))}
        </span>
      ),
    },
    {
      key: "status",
      header: dict.table.status,
      headerClassName: "hidden sm:table-cell",
      cell: (application) => (
        <span
          className={cn(
            "inline-flex rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
            STATUS_TONES[application.status]
          )}
        >
          {statusLabels[application.status]}
        </span>
      ),
    },
    {
      key: "reviewedAt",
      header: dict.admin.teachersReviewedColumn,
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
      cell: (application) => {
        const date = formatReviewDate(application.reviewedAt, locale);
        if (!date) return <span className="text-neutral-400">—</span>;

        return (
          <span className="block">
            <span className="block tabular-nums">{date}</span>
            <span className="block text-xs text-neutral-500">
              {reviewerName(application.reviewedBy) ?? dict.admin.teachersReviewerUnknown}
            </span>
          </span>
        );
      },
    },
  ];

  return (
    <DataTable
      rows={applications}
      columns={columns}
      rowKey={(application) => String(application.id)}
      primaryHeader={dict.login.emailLabel}
      primary={(application) => application.user?.email ?? dict.admin.teachersNoUser}
      meta={(application) => (application.languages ?? []).join(", ").toUpperCase()}
      actions={actions}
      labels={dict.table}
      extraChrome={extraChrome}
    />
  );
}
