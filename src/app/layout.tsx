import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { BRAND, DESCRIPTION, TAGLINE } from "@/content/site";
import "./globals.css";

/*
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

export const metadata: Metadata = {
  title: `${BRAND} · ${TAGLINE}`,
  description: DESCRIPTION,
  applicationName: BRAND,
  robots: { index: true, follow: true },
  openGraph: {
    title: `${BRAND} · ${TAGLINE}`,
    description: DESCRIPTION,
    type: "website",
    locale: "en_GB",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F8FC",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
