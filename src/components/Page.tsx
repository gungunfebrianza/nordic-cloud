import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { How } from "@/components/how/How";
import { Nav } from "@/components/nav/Nav";
import { Pricing } from "@/components/pricing/Pricing";
import { Products } from "@/components/products/Products";
import { Section } from "@/components/Section";
import { Security } from "@/components/security/Security";
import { UseCases } from "@/components/use-cases/UseCases";
import { COPY, languageLinks, type Locale } from "@/content/i18n";
import { SECTION_IDS } from "@/content/site";

/** The whole landing page in one language. Every section takes that language's copy as `t`. */
export function Page({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const languages = languageLinks();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
      >
        {t.common.skipToContent}
      </a>
      <Nav locale={locale} t={t.nav} languageLabel={t.common.languageLabel} languages={languages} />
      <main id="main">
        {SECTION_IDS.map((id) =>
          id === "hero" ? (
            <Hero key={id} t={t} />
          ) : id === "products" ? (
            <Products key={id} t={t} />
          ) : id === "how" ? (
            <How key={id} t={t} />
          ) : id === "use-cases" ? (
            <UseCases key={id} t={t} />
          ) : id === "pricing" ? (
            <Pricing key={id} t={t} />
          ) : id === "security" ? (
            <Security key={id} t={t} />
          ) : (
            <Section key={id} id={id} label={t.sections[id]} className="min-h-[50vh]">
              <h2 className="font-mono text-xs font-medium tracking-wider text-ink-muted uppercase">
                #{id}
              </h2>
            </Section>
          ),
        )}
      </main>
      <Footer t={t} languages={languages} />
    </>
  );
}
