import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog/strapi";
import { defaultLocale, locales } from "@/lib/i18n";
import { getQuizzes } from "@/lib/quizzes/data";
import { getLocalizedUrl } from "@/lib/seo";

const publicPaths = ["", "/about", "/blog", "/quizzes"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = locales.flatMap((locale) =>
    publicPaths.map((pathname) => ({
      url: getLocalizedUrl(locale, pathname),
      changeFrequency: pathname === "" ? ("weekly" as const) : ("monthly" as const),
      priority: pathname === "" ? 1 : 0.8,
    })),
  );

  const blogPosts = await getBlogPosts();
  const blogRoutes = locales.flatMap((locale) =>
    blogPosts.map((post) => ({
      url: getLocalizedUrl(locale, `/blog/${post.slug}`),
      changeFrequency: "monthly" as const,
      priority: locale === defaultLocale ? 0.7 : 0.6,
    })),
  );

  const quizzes = await getQuizzes();
  const quizRoutes = locales.flatMap((locale) =>
    quizzes.map((quiz) => ({
      url: getLocalizedUrl(locale, `/quizzes/${quiz.id}`),
      changeFrequency: "monthly" as const,
      priority: locale === defaultLocale ? 0.7 : 0.6,
    })),
  );

  return [...staticRoutes, ...blogRoutes, ...quizRoutes];
}
