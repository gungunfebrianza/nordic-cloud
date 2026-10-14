import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { COPY, LOCALES, SITE_URL, localeHref, type Locale } from "@/content/i18n";
import { BRAND } from "@/content/site";
import "./globals.css";

/*
 * Shared by the two root layouts, (en) and (da), so each page has its own <html lang>.
 *
 * next/font downloads these at build time and serves them from our own origin.
 * Visitors never send a request to Google (EU GDPR). tests/smoke.spec.ts asserts this.
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

/** Per-language metadata, with hreflang alternates for both languages and x-default → English. */
export function metadataFor(locale: Locale): Metadata {
  const t = COPY[locale];
  const title = `${BRAND} · ${t.meta.tagline}`;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: t.meta.description,
    applicationName: BRAND,
    robots: { index: true, follow: true },
    alternates: {
      canonical: localeHref(locale),
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localeHref(l)])),
        "x-default": localeHref("en"),
      },
    },
    openGraph: {
      title,
      description: t.meta.description,
      type: "website",
      locale: t.meta.ogLocale,
      url: localeHref(locale),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#F6F8FC",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export function Html({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
