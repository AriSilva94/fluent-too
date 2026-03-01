import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { blogData } from "@/lib/blogData";
import type { Metadata } from "next";
import { buildPageMetadata, getLocalizedUrl, getSiteName } from "@/lib/seo";

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findPostBySlug(locale: Locale, slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  return blogData[locale].find((post) => normalizeSlug(post.slug) === normalizedSlug);
}

export async function generateStaticParams() {
  return Object.entries(blogData).flatMap(([locale, posts]) =>
    posts.map((post) => ({
      locale,
      slug: post.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) return {};

  const post = findPostBySlug(locale, slug);
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
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const post = findPostBySlug(locale as Locale, slug);

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
    <div className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${locale}/blog`}
        className="text-sm text-gray-500 transition-colors hover:text-gray-900 flex items-center gap-1 mb-8"
      >
        {dict.blog.backToBlog}
      </Link>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-brand-orange px-3 py-1 font-semibold uppercase tracking-wide text-white">
          {post.category}
        </span>
        <span className="text-brand-orange font-medium">{dict.home.blog.title}</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">{post.readingTime} {dict.blog.readingTime}</span>
      </div>

      <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
        {post.title}
      </h1>

      <div className="mt-6 flex items-center gap-3 border-b border-gray-100 pb-8 text-sm text-gray-500">
        <div className="h-10 w-10 rounded-full bg-brand-orange/10 flex items-center justify-center font-bold text-brand-orange text-lg">
          {post.author.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-900">{post.author}</div>
          <div>{post.date}</div>
        </div>
      </div>

      {post.coverImage && (
        <div
          className="mt-8 h-64 sm:h-80 w-full rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${post.coverImage})` }}
        />
      )}

      <div className="mt-8 prose prose-lg prose-orange max-w-none text-gray-600">
        {typeof post.content === 'string' ? (
          post.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))
        ) : (
          post.content
        )}
      </div>
    </div>
  );
}
