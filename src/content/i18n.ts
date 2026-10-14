/**
 * Languages. English at /, Danish at /da/. Both are static pages; the switch is a plain link.
 */
import type { Copy, Locale } from "./copy-types";
import { da } from "./da";
import { en } from "./en";

export type { Locale } from "./copy-types";

export const LOCALES: readonly Locale[] = ["en", "da"];
export const DEFAULT_LOCALE: Locale = "en";

export const COPY: Record<Locale, Copy> = { en, da };

/** The page for a language. */
export const localeHref = (locale: Locale) => (locale === "en" ? "/" : `/${locale}/`);

/** Links for the EN · DA switch, as plain data for client components. Each name is in its own language. */
export const languageLinks = () =>
  LOCALES.map((l) => ({
    locale: l,
    href: localeHref(l),
    label: l.toUpperCase(),
    name: COPY[l].common.languageNames[l],
  }));

/**
 * Absolute origin for canonical and hreflang URLs. Set NEXT_PUBLIC_SITE_URL at build for
 * production; the default is the local preview server.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4173";
