import type { Metadata } from "next";
import { COPY, LOCALES, localeHref } from "@/content/i18n";
import { BRAND } from "@/content/site";
import { Html } from "./shell";

/** The one 404 for every unmatched URL. English first, Danish below, each in its own lang. */
export const metadata: Metadata = {
  title: `${COPY.en.notFound.title} · ${BRAND}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <Html locale="en">
      <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col justify-center gap-12 px-5 py-24">
        <p className="font-display text-lg font-semibold tracking-display text-ink">{BRAND}</p>
        {LOCALES.map((l) => {
          const t = COPY[l].notFound;
          return (
            <section key={l} lang={l}>
              <h1 className="text-3xl font-semibold text-ink">{t.title}</h1>
              <p className="mt-3 text-ink-muted">{t.body}</p>
              <a
                href={localeHref(l)}
                hrefLang={l}
                className="mt-4 inline-block font-medium text-signal"
              >
                {t.home} →
              </a>
            </section>
          );
        })}
      </main>
    </Html>
  );
}
