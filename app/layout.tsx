import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { seoLang, SITE_URL, uiLang } from "@/lib/seo-copy";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = seoLang((await headers()).get("x-site-lang"));
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="scroll-smooth">
      <body className={inter.className}>
        <LanguageProvider initialLang={uiLang(lang)}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}