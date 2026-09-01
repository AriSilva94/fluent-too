import type { Transition } from "motion/react";

export const SPRING_CONTROL: Transition = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 };

export const SPRING_CONTENT: Transition = { type: "spring", stiffness: 260, damping: 30 };

export const SPRING_ENTER: Transition = { type: "spring", stiffness: 170, damping: 24 };

export const EXIT_TRANSITION: Transition = { duration: 0.22, ease: [0.4, 0, 1, 1] };

export const SWAP_LEAD = 0.14;

export const ENTER_OFFSET_Y = 18;

export const STAGGER_STEP = 0.07;
export const STAGGER_MAX_STEPS = 4;

export function staggerDelay(index: number) {
  return SWAP_LEAD + Math.min(index, STAGGER_MAX_STEPS) * STAGGER_STEP;
}
