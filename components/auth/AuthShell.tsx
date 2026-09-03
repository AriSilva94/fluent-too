"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { assetUrl } from "@/lib/cdnAssets";
import { QUIZ_LEVEL } from "@/lib/quizzes/types";
import type { AuthVisual } from "@/lib/auth/visual";

type AuthShellProps = {
  children: ReactNode;
  visual: AuthVisual;
};

const LEVELS = Object.values(QUIZ_LEVEL);

export default function AuthShell({ children, visual }: AuthShellProps) {
  return (
    <main className="flex flex-1 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fff7f1_58%,#eef5ff_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="auth-rise grid w-full overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(65,132,249,0.18)] ring-1 ring-brand-blue/10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          <section className="relative hidden min-h-[560px] flex-col justify-end overflow-hidden bg-brand-blue lg:flex">
            <Image
              src={assetUrl("assets/images/FOTO-BANNER-TOPO.webp")}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 0px"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-brand-blue/35" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-[linear-gradient(to_top,rgba(30,74,158,0.94)_0%,rgba(30,74,158,0.72)_38%,rgba(30,74,158,0)_100%)]" />

            <div className="relative z-10 p-10 xl:p-12">
              <p className="max-w-md text-4xl font-black leading-[1.08] text-white xl:text-[2.75rem]">{visual.headline}</p>
              <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-white/85">{visual.text}</p>

              <ul className="mt-8 space-y-3">
                {visual.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm font-bold text-white/95">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-inset ring-white/30">
                      <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap gap-1.5 border-t border-white/20 pt-6">
                {LEVELS.map((level) => (
                  <span
                    key={level}
                    className="rounded-md bg-white/12 px-2.5 py-1 text-[11px] font-black tracking-wide text-white/90 ring-1 ring-inset ring-white/25"
                  >
                    {level}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
            <div className="w-full max-w-[400px]">
              {children}

              <ul className="mt-8 space-y-2 border-t border-brand-blue/10 pt-6 lg:hidden">
                {visual.points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-xs font-bold text-brand-blue-ink/80">
                    <Check aria-hidden className="h-3.5 w-3.5 flex-shrink-0 text-brand-orange" strokeWidth={3} />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-brand-blue/10 pt-5 text-xs font-semibold text-neutral-500 lg:justify-start">
                <Link href={visual.legal.termsHref} className="font-bold text-brand-blue-ink transition-colors hover:text-brand-orange">
                  {visual.legal.termsLabel}
                </Link>
                <span aria-hidden className="text-neutral-300">·</span>
                <Link href={visual.legal.privacyHref} className="font-bold text-brand-blue-ink transition-colors hover:text-brand-orange">
                  {visual.legal.privacyLabel}
                </Link>
                <span aria-hidden className="text-neutral-300">·</span>
                <span>{visual.legal.copyright}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
