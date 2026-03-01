import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import LoginForm from "./LoginForm";
import { buildPageMetadata } from "@/lib/seo";

const loginDescriptions: Record<Locale, string> = {
  "pt-br": "Área de acesso da Fluent Too para estudantes e membros autenticados.",
  "en-us": "Fluent Too sign-in area for students and authenticated members.",
  "fr-fr": "Espace de connexion Fluent Too pour les élèves et les membres authentifiés.",
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
    pathname: "/login",
    title: `${dict.login.title} | Fluent Too`,
    description: loginDescriptions[locale],
    index: false,
  });
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return <LoginForm dict={dict} />;
}
