"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import PagedPanel, { TABLE_VIEWPORT_RESERVE, type PagedPanelLabels } from "./PagedPanel";

export { TABLE_VIEWPORT_RESERVE };

export type DataColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableLabels = PagedPanelLabels;

interface Props<T> {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  primary: (row: T) => ReactNode;
  primaryHeader: string;
  meta?: (row: T) => ReactNode;
  actions: (row: T) => ReactNode;
  labels: DataTableLabels;
  pageSize?: number;
  extraChrome?: number;
}

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  primary,
  primaryHeader,
  meta,
  actions,
  labels,
  pageSize,
  extraChrome,
}: Props<T>) {
  return (
    <PagedPanel rows={rows} labels={labels} pageSize={pageSize} extraChrome={extraChrome}>
      {(pageRows) => (
        <table className="w-full border-collapse text-left">
          <thead className="bg-white sm:sticky sm:top-0 sm:z-10">
            <tr className="border-b border-neutral-200">
              <th scope="col" className={headClass}>
                {primaryHeader}
              </th>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn(headClass, column.headerClassName)}>
                  {column.header}
                </th>
              ))}
              <th scope="col" className={cn(headClass, "hidden text-right sm:table-cell")}>
                <span className="sr-only">{labels.actions}</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                className="flex flex-wrap items-center border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 sm:table-row"
              >
                <td className="w-full px-5 pt-3 align-middle sm:w-auto sm:py-3">
                  <p className="font-bold text-neutral-900">{primary(row)}</p>
                  {meta && <p className="mt-1 text-sm text-neutral-500 md:hidden">{meta(row)}</p>}
                </td>
                {columns.map((column) => (
                  <td key={column.key} className={cn(cellClass, column.cellClassName)}>
                    {column.cell(row)}
                  </td>
                ))}
                <td className="px-5 py-3 pl-0 align-middle sm:pl-5">
                  <div className="flex flex-wrap gap-2 sm:justify-end">{actions(row)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PagedPanel>
  );
}

const headClass = "px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-neutral-500";

const cellClass = "px-5 py-3 align-middle text-sm text-neutral-600";

export const rowActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-brand-blue ring-1 ring-brand-blue/20 transition-colors hover:bg-brand-blue/5 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 sm:min-h-8 sm:px-3 sm:text-xs";

export const rowDangerActionClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-red-50 px-4 text-sm font-bold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:min-h-8 sm:px-3 sm:text-xs";
