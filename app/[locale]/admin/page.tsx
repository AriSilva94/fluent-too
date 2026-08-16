import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

const adminDescriptions: Record<Locale, string> = {
  "pt-br": "Painel administrativo da Fluent Too para gestão de conteúdo e usuários.",
  "en-us": "Fluent Too admin panel for content and user management.",
  "fr-fr": "Panneau d'administration Fluent Too pour la gestion du contenu et des utilisateurs.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/admin",
    title: `${dict.admin.title} | Fluent Too`,
    description: adminDescriptions[locale],
    index: false,
  });
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  redirect(`${process.env.STRAPI_PUBLIC_URL ?? "http://localhost:1337"}/admin`);
}
