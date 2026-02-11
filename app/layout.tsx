import { Dosis } from "next/font/google";
import "./globals.css";

const dosis = Dosis({
  variable: "--font-dosis",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${dosis.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
