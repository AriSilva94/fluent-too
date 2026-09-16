import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CalendarDays, Clock, ImageOff, ArrowRight } from "lucide-react";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { getBlogPosts } from "@/lib/blog/strapi";
import { formatBlogDate } from "@/lib/blog/format-date";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import StudyLanguageFilter from "@/components/StudyLanguageFilter";
import { readStudyLanguage } from "@/lib/study-language-server";
import { buildStudyLanguageLabels, toTargetLanguage } from "@/lib/study-language";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return {
    ...buildPageMetadata({
      locale,
      pathname: "/blog",
      title: dict.metadata.blog.title,
      description: dict.metadata.blog.description,
    }),
  };
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const studyLanguage = await readStudyLanguage();
  const posts = await getBlogPosts(toTargetLanguage(studyLanguage));

  return (
    <div className="bg-[linear-gradient(180deg,#f5f8ff_0%,#ffffff_28%)]">
      <Container className="py-14 sm:py-20">
        <SectionHeading title={dict.blog.title} subtitle={dict.home.blog.subtitle} center as="h1" />

        <div className="mt-10 flex justify-center">
          <StudyLanguageFilter value={studyLanguage} labels={buildStudyLanguageLabels(dict.studyLanguage)} />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${locale}/blog/${post.slug}?idioma=${post.targetLanguage}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04),0_16px_36px_-20px_rgba(17,17,17,0.22)] ring-1 ring-neutral-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(17,17,17,0.06),0_28px_48px_-20px_rgba(255,103,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-neutral-100">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300">
                    <ImageOff aria-hidden className="size-10" />
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-orange shadow-sm">
                  {post.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden className="size-3.5" />
                    {formatBlogDate(post.date, locale as Locale)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock aria-hidden className="size-3.5" />
                    {post.readingTime} {dict.blog.readingTime}
                  </span>
                </div>

                <h2 className="mb-2.5 text-xl font-bold leading-snug text-neutral-900 transition-colors group-hover:text-brand-orange line-clamp-2">
                  {post.title}
                </h2>

                <p className="flex-1 text-sm leading-relaxed text-neutral-500 line-clamp-3">{post.excerpt}</p>

                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="text-xs font-semibold text-neutral-500">{post.author}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-orange">
                    {dict.blog.readMore}
                    <ArrowRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/60 px-6 py-20 text-center">
              <BookOpen aria-hidden className="size-10 text-neutral-300" />
              <p className="text-base font-semibold text-neutral-500">{dict.blog.noPosts}</p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
