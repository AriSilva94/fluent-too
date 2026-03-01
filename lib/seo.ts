import type { Metadata } from "next";
import { defaultLocale, localeToHtmlLang, locales, type Locale } from "@/lib/i18n";

const siteName = "Fluent Too";
const defaultTitle = "Fluent Too";
const defaultDescription = {
  "pt-br": "Plataforma para aprender idiomas com quizzes, artigos e recursos práticos.",
  "en-us": "Language learning platform with quizzes, articles, and practical resources.",
  "fr-fr": "Plateforme d'apprentissage des langues avec des quizzes, des articles et des ressources pratiques.",
} satisfies Record<Locale, string>;

function normalizeSiteUrl(value?: string) {
  if (!value) return "http://localhost:3000";

  const url = value.startsWith("http") ? value : `https://${value}`;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export function getLocalizedPath(locale: Locale, pathname = "") {
  if (!pathname || pathname === "/") {
    return `/${locale}`;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${normalizedPath}`;
}

export function getLocalizedUrl(locale: Locale, pathname = "") {
  return `${getSiteUrl()}${getLocalizedPath(locale, pathname)}`;
}

export function getLanguageAlternates(pathname = "") {
  const languages = Object.fromEntries(
    locales.map((locale) => [localeToHtmlLang[locale], getLocalizedUrl(locale, pathname)]),
  );

  return {
    languages: {
      ...languages,
      "x-default": getLocalizedUrl(defaultLocale, pathname),
    },
  };
}

export function buildPageMetadata({
  locale,
  title,
  description,
  pathname = "",
  image = "/icon.png",
  type = "website",
  index = true,
}: {
  locale: Locale;
  title: string;
  description: string;
  pathname?: string;
  image?: string;
  type?: "website" | "article";
  index?: boolean;
}): Metadata {
  const canonical = getLocalizedPath(locale, pathname);
  const imageUrl = image.startsWith("http") ? image : `${getSiteUrl()}${image}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      ...getLanguageAlternates(pathname),
    },
    openGraph: {
      type,
      locale: localeToHtmlLang[locale],
      url: getLocalizedUrl(locale, pathname),
      siteName,
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: index
      ? undefined
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        },
  };
}

export function getDefaultMetadata(locale: Locale): Metadata {
  return buildPageMetadata({
    locale,
    title: defaultTitle,
    description: defaultDescription[locale],
  });
}

export function getSiteName() {
  return siteName;
}
