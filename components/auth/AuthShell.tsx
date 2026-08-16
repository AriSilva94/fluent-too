"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  homeHref?: string;
  visualTitle: string;
  visualText: string;
};

export default function AuthShell({ children, homeHref = "/pt-br/", visualTitle, visualText }: AuthShellProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white lg:min-h-[calc(100vh-6.5rem)]">
      <div className="grid min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.82fr)]">
        <section className="relative hidden overflow-hidden bg-brand-blue lg:block">
          <Image
            src="/assets/img/FOTO-BANNER-TOPO.png"
            alt=""
            fill
            sizes="54vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-brand-blue/20" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-blue/85 to-transparent" />
          <div className="absolute left-10 top-8">
            <Link href={homeHref} className="inline-flex">
              <Image
                src="/assets/img/LOGOTIPO-TOPO.png"
                alt="Fluent Too"
                width={190}
                height={70}
                className="h-auto w-[170px] brightness-0 invert"
                priority
              />
            </Link>
          </div>
          <div className="absolute bottom-12 left-10 max-w-xl pr-10 text-white">
            <p className="text-5xl font-black leading-none">{visualTitle}</p>
            <p className="mt-4 max-w-md text-xl font-semibold leading-snug text-white/92">{visualText}</p>
          </div>
        </section>
        <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#fff7f1_54%,#eef5ff_100%)] px-4 py-10 sm:px-6 lg:min-h-[calc(100vh-6.5rem)] lg:px-10">
          <div className="w-full max-w-[460px]">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
