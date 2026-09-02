"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE, paginate } from "@/lib/pagination";

export const TABLE_VIEWPORT_RESERVE = 539;

export type PagedPanelLabels = {
  range: string;
  page: string;
  previous: string;
  next: string;
  actions: string;
};

interface Props<T> {
  rows: T[];
  labels: PagedPanelLabels;
  children: (rows: T[]) => ReactNode;
  pageSize?: number;
  extraChrome?: number;
  bodyClassName?: string;
}

export default function PagedPanel<T>({
  rows,
  labels,
  children,
  pageSize = DEFAULT_PAGE_SIZE,
  extraChrome = 0,
  bodyClassName,
}: Props<T>) {
  const [requestedPage, setRequestedPage] = useState(1);
  const view = paginate(rows, requestedPage, pageSize);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const check = () => setHasMoreBelow(element.scrollHeight - element.scrollTop > element.clientHeight + 1);
    check();
    element.addEventListener("scroll", check);
    const observer = new ResizeObserver(check);
    observer.observe(element);

    return () => {
      element.removeEventListener("scroll", check);
      observer.disconnect();
    };
  }, [view.page, view.rows.length]);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
      <div className="relative">
        <div
          ref={scrollRef}
          style={{ ["--table-reserve" as string]: `${TABLE_VIEWPORT_RESERVE + extraChrome}px` }}
          className={cn(
            "overflow-visible sm:max-h-[calc(100dvh-var(--table-reserve))] sm:min-h-56 sm:overflow-y-auto sm:[scrollbar-color:#d4d4d4_transparent] sm:[scrollbar-width:thin]",
            bodyClassName
          )}
        >
          {children(view.rows)}
        </div>
        {hasMoreBelow && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3">
        <p className="text-sm text-neutral-600">
          {labels.range
            .replace("{from}", String(view.from))
            .replace("{to}", String(view.to))
            .replace("{total}", String(view.total))}
        </p>

        <div className="flex items-center gap-3">
          <p aria-live="polite" className="text-sm font-semibold text-neutral-700">
            {labels.page.replace("{page}", String(view.page)).replace("{pages}", String(view.pageCount))}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={labels.previous}
              disabled={view.page <= 1}
              onClick={() => setRequestedPage(view.page - 1)}
              className={pagerClass}
            >
              <ChevronLeft aria-hidden className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={labels.next}
              disabled={view.page >= view.pageCount}
              onClick={() => setRequestedPage(view.page + 1)}
              className={pagerClass}
            >
              <ChevronRight aria-hidden className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const pagerClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
