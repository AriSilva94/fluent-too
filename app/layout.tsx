import type { Metadata } from "next";
import { Dosis } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { defaultLocale, isValidLocale, localeToHtmlLang } from "@/lib/i18n";
import { getMetadataBase, getSiteName } from "@/lib/seo";

const dosis = Dosis({
  variable: "--font-dosis",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: getSiteName(),
  title: getSiteName(),
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const localeHeader = headersList.get("x-locale") ?? defaultLocale;
  const locale = isValidLocale(localeHeader) ? localeHeader : defaultLocale;

  return (
    <html lang={localeToHtmlLang[locale]}>
      <body className={`${dosis.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
