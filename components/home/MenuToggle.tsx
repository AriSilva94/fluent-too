"use client";

import { cn } from "@/lib/utils";

type MenuToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
  labelOpen: string;
  labelClose: string;
  controls: string;
};

const BAR_BASE =
  "absolute left-0 top-1/2 -mt-[1.25px] block h-[2.5px] rounded-full bg-current transition-[transform,opacity,width] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";

export default function MenuToggle({ isOpen, onToggle, labelOpen, labelClose, controls }: MenuToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? labelClose : labelOpen}
      aria-expanded={isOpen}
      aria-controls={controls}
      className={cn(
        "relative z-50 flex h-11 w-11 items-center justify-center rounded-full border text-white",
        "transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-orange",
        isOpen ? "border-white/60 bg-white/20" : "border-white/25 bg-white/10 hover:bg-white/20"
      )}
    >
      <span aria-hidden className="relative block h-5 w-[22px]">
        <span className={cn(BAR_BASE, "w-full", isOpen ? "rotate-45" : "-translate-y-[6px]")} />
        <span className={cn(BAR_BASE, isOpen ? "w-0 opacity-0" : "w-[15px] opacity-100")} />
        <span className={cn(BAR_BASE, "w-full", isOpen ? "-rotate-45" : "translate-y-[6px]")} />
      </span>
    </button>
  );
}
