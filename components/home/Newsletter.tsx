"use client";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import type { Dictionary } from "@/lib/getDictionary";

export default function Newsletter({ dict }: { dict: Dictionary }) {
  return (
    <section id="contato" className="relative z-10 -mt-12 md:-mt-16">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 rounded-[var(--radius-newsletter)] bg-brand-blue px-5 py-6 shadow-xl lg:flex-row lg:px-10 lg:py-8">
          <div className="w-full text-center lg:w-auto lg:max-w-md lg:text-left">
            <h2 className="font-bold text-white [font-size:var(--text-newsletter-title)]">
              {dict.home.newsletter.title}
            </h2>
            <p className="mt-2 font-medium text-white/80 [font-size:var(--text-newsletter-sub)]">
              {dict.home.newsletter.subtitle}
            </p>
          </div>

          <form
            className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-end"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Name field */}
            <div className="w-full lg:w-64">
              <label
                htmlFor="newsletter-name"
                className="mb-1.5 block font-medium text-white [font-size:var(--text-label)]"
              >
                {dict.home.newsletter.nameLabel}
              </label>
              <input
                id="newsletter-name"
                type="text"
                placeholder={dict.home.newsletter.namePlaceholder}
                className="w-full rounded-lg bg-white px-4 py-3 font-medium text-foreground placeholder:text-neutral-text focus:outline-none focus:ring-2 focus:ring-white/50 [font-size:var(--text-label)]"
              />
            </div>

            {/* Email field */}
            <div className="w-full lg:w-64">
              <label
                htmlFor="newsletter-email"
                className="mb-1.5 block font-medium text-white [font-size:var(--text-label)]"
              >
                {dict.home.newsletter.emailLabel}
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder={dict.home.newsletter.emailPlaceholder}
                className="w-full rounded-lg bg-white px-4 py-3 font-medium text-foreground placeholder:text-neutral-text focus:outline-none focus:ring-2 focus:ring-white/50 [font-size:var(--text-label)]"
              />
            </div>

            <div className="w-full lg:w-auto">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 [font-size:var(--text-btn-subscribe)] lg:w-auto"
              >
                {dict.home.newsletter.submit}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}
