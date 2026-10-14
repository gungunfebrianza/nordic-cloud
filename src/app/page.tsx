import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { How } from "@/components/how/How";
import { Products } from "@/components/products/Products";
import { Nav } from "@/components/nav/Nav";
import { Section } from "@/components/Section";
import { UseCases } from "@/components/use-cases/UseCases";
import { SECTIONS } from "@/content/site";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        {SECTIONS.map((s) =>
          s.id === "hero" ? (
            <Hero key={s.id} />
          ) : s.id === "products" ? (
            <Products key={s.id} />
          ) : s.id === "how" ? (
            <How key={s.id} />
          ) : s.id === "use-cases" ? (
            <UseCases key={s.id} />

          ) : (
            <Section key={s.id} id={s.id} label={s.label} className="min-h-[50vh]">
              <h2 className="font-mono text-xs font-medium tracking-wider text-ink-muted uppercase">
                #{s.id}
              </h2>
            </Section>
          ),
        )}
      </main>
      <Footer />
    </>
  );
}
