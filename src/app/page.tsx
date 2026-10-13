import { Footer } from "@/components/Footer";
import { Nav } from "@/components/nav/Nav";
import { Section } from "@/components/Section";
import { BRAND, SECTIONS, TAGLINE } from "@/content/site";

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
            <Section key={s.id} id={s.id} label={s.label} className="min-h-[70vh]">
              <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">
                {BRAND} · Scaffold
              </p>
              <h1 className="mt-4 max-w-[16ch] text-5xl font-bold text-ink sm:text-7xl">
                {TAGLINE}
              </h1>
            </Section>
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
