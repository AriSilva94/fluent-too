import type { MetadataRoute } from "next";
import { blogData } from "@/lib/blogData";
import { defaultLocale, locales } from "@/lib/i18n";
import { quizzes } from "@/lib/quizzes/data";
import { getLocalizedUrl } from "@/lib/seo";

const publicPaths = ["", "/about", "/blog", "/quizzes"];

function getLocaleFromTargetLanguage(targetLanguage: "pt" | "en" | "fr") {
  switch (targetLanguage) {
    case "pt":
      return "pt-br";
    case "en":
      return "en-us";
    case "fr":
      return "fr-fr";
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = locales.flatMap((locale) =>
    publicPaths.map((pathname) => ({
      url: getLocalizedUrl(locale, pathname),
      changeFrequency: pathname === "" ? ("weekly" as const) : ("monthly" as const),
      priority: pathname === "" ? 1 : 0.8,
    })),
  );

  const blogRoutes = locales.flatMap((locale) =>
    blogData[locale].map((post) => ({
      url: getLocalizedUrl(locale, `/blog/${post.slug}`),
      changeFrequency: "monthly" as const,
      priority: locale === defaultLocale ? 0.7 : 0.6,
    })),
  );

  const quizRoutes = quizzes.map((quiz) => {
    const locale = getLocaleFromTargetLanguage(quiz.targetLanguage);

    return {
      url: getLocalizedUrl(locale, `/quizzes/${quiz.id}`),
      changeFrequency: "monthly" as const,
      priority: locale === defaultLocale ? 0.7 : 0.6,
    };
  });

  return [...staticRoutes, ...blogRoutes, ...quizRoutes];
}
