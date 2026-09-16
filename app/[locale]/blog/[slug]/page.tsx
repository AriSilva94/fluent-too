import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { getBlogPostBySlug } from "@/lib/blog/strapi";
import { formatBlogDate } from "@/lib/blog/format-date";
import { isMemberOf } from "@/lib/enums";
import { TARGET_LANGUAGE } from "@/lib/quizzes/types";
import type { Metadata } from "next";
import { buildPageMetadata, getLocalizedUrl, getSiteName, serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  return buildPageMetadata({
    locale,
    pathname: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    image: post.coverImage ?? "/icon.png",
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ idioma?: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const { idioma } = await searchParams;
  const dict = await getDictionary(locale as Locale);
  const post = await getBlogPostBySlug(slug, isMemberOf(TARGET_LANGUAGE, idioma) ? idioma : undefined);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: getSiteName(),
    },
    mainEntityOfPage: getLocalizedUrl(locale as Locale, `/blog/${post.slug}`),
    image: post.coverImage ? [post.coverImage] : undefined,
    inLanguage: locale,
  };

  return (
    <div className="bg-[linear-gradient(180deg,#f5f8ff_0%,#ffffff_22%)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
        <div className="auth-rise">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold text-brand-blue-ink transition-colors hover:bg-[#f5f8ff]"
          >
            {dict.blog.backToBlog}
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500">
              <CalendarDays aria-hidden className="size-4" />
              {formatBlogDate(post.date, locale as Locale)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500">
              <Clock aria-hidden className="size-4" />
              {post.readingTime} {dict.blog.readingTime}
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-black leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl">
            {post.title}
          </h1>

          <div className="mt-8 flex items-center gap-3 border-b border-neutral-100 pb-8">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-lg font-black text-brand-orange ring-1 ring-brand-orange/15">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm font-bold text-neutral-900">{post.author}</div>
          </div>

          {post.coverImage && (
            <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_24px_56px_-28px_rgba(17,17,17,0.35)]">
              <Image src={post.coverImage} alt={post.title} fill sizes="768px" priority className="object-cover" />
            </div>
          )}

          <div className="prose prose-lg prose-neutral mt-10 max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-a:font-semibold prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline prose-strong:text-neutral-900">
            {typeof post.content === "string"
              ? post.content.split("\n\n").map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
              : post.content}
          </div>

          <div className="mt-14 border-t border-neutral-100 pt-8">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center text-sm font-bold text-brand-orange hover:underline"
            >
              {dict.blog.backToBlog}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
