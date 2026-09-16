"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function toDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildGrid(viewDate: Date): Date[] {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

const MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const DISPLAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function DateField({
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
}) {
  const selectedDate = toDate(value);
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate ?? today);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openPanel() {
    setViewDate(selectedDate ?? today);
    setOpen(true);
  }

  function selectDay(date: Date) {
    onChange(toValue(date));
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  const days = buildGrid(viewDate);
  const label = MONTH_FORMATTER.format(viewDate).replace(/^\w/, (char) => char.toUpperCase());

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white py-3 pl-4 pr-4 text-left text-base text-neutral-900 transition-colors duration-150 hover:border-neutral-400 focus:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
          open && "border-blue-500 ring-2 ring-blue-500/40",
          className
        )}
      >
        <span className={cn(!selectedDate && "text-neutral-500")}>
          {selectedDate ? DISPLAY_FORMATTER.format(selectedDate) : "dd/mm/aaaa"}
        </span>
        <CalendarDays
          aria-hidden
          className={cn("size-4 shrink-0 text-neutral-500 transition-colors duration-150", open && "text-blue-500")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Selecionar data"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-20 mt-2 w-72 origin-top rounded-xl border border-neutral-200 bg-white p-3 shadow-lg shadow-neutral-900/10"
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-sm font-semibold text-neutral-800">{label}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Mês anterior"
                  onClick={(event) => {
                    event.preventDefault();
                    shiftMonth(-1);
                  }}
                  className="flex size-7 items-center justify-center rounded-md text-neutral-500 transition-colors duration-100 hover:bg-blue-50 hover:text-blue-600"
                >
                  <ChevronLeft aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Próximo mês"
                  onClick={(event) => {
                    event.preventDefault();
                    shiftMonth(1);
                  }}
                  className="flex size-7 items-center justify-center rounded-md text-neutral-500 transition-colors duration-100 hover:bg-blue-50 hover:text-blue-600"
                >
                  <ChevronRight aria-hidden className="size-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 px-1 pb-1">
              {WEEKDAY_LABELS.map((weekday, index) => (
                <span
                  key={`${weekday}-${index}`}
                  className="flex h-7 items-center justify-center text-xs font-semibold text-neutral-400"
                >
                  {weekday}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 px-1">
              {days.map((date) => {
                const inCurrentMonth = date.getMonth() === viewDate.getMonth();
                const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      selectDay(date);
                    }}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-100",
                      inCurrentMonth ? "text-neutral-800" : "text-neutral-300",
                      !isSelected && "hover:bg-blue-50 hover:text-blue-700",
                      isToday && !isSelected && "font-semibold text-blue-600",
                      isSelected && "bg-blue-600 font-semibold text-white hover:bg-blue-600"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 px-1 pt-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onChange("");
                  setOpen(false);
                }}
                className="rounded-md px-2 py-1 text-sm font-semibold text-neutral-500 transition-colors duration-100 hover:bg-neutral-100 hover:text-neutral-700"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  selectDay(today);
                }}
                className="rounded-md px-2 py-1 text-sm font-semibold text-blue-600 transition-colors duration-100 hover:bg-blue-50"
              >
                Hoje
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
