import { Dosis } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { defaultLocale, isValidLocale, type Locale } from "@/lib/i18n";

const dosis = Dosis({
  variable: "--font-dosis",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const langMap: Record<Locale, string> = {
  "pt-br": "pt-BR",
  "en-us": "en-US",
  "fr-fr": "fr-FR",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const localeHeader = headersList.get("x-locale") ?? defaultLocale;
  const locale: Locale = isValidLocale(localeHeader) ? localeHeader : defaultLocale;

  return (
    <html lang={langMap[locale]}>
      <body className={`${dosis.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
