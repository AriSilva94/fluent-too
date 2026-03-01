import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { blogData } from "@/lib/blogData";
import { buildPageMetadata } from "@/lib/seo";

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
  const posts = blogData[locale as Locale] || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{dict.blog.title}</h1>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg h-full"
          >
             <div 
                className="h-48 w-full bg-cover bg-center shrink-0"
                style={{ backgroundImage: post.coverImage ? `url(${post.coverImage})` : undefined }} 
              >
                  {!post.coverImage && <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>}
              </div>
            <div className="flex flex-col flex-grow p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 font-semibold uppercase tracking-wide text-brand-orange">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.readingTime} {dict.blog.readingTime}</span>
                </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-brand-orange transition-colors mb-2 line-clamp-2">
                  {post.title}
              </h2>
              <p className="text-gray-600 line-clamp-3 text-sm flex-grow">
                  {post.excerpt}
              </p>
              <div className="mt-4 text-brand-orange font-medium text-sm group-hover:underline">
                  {dict.blog.readMore} &rarr;
              </div>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                <p>{dict.blog.noPosts}</p>
            </div>
        )}
      </div>
    </div>
  );
}
