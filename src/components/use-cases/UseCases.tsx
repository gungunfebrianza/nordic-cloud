import type { Copy } from "@/content/copy-types";
import { USE_CASE_IDS } from "@/content/use-cases";
import { UseCasesMotion } from "./UseCasesMotion";
import { UseCaseTile } from "./UseCaseTile";

/**
 * Six verticals. Desktop: a 3×3 bento with Economy spanning 2×2. Tablet: 2 columns, Economy full
 * width. Mobile: a native scroll-snap carousel with a position counter.
 */
export function UseCases({ t }: { t: Copy }) {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-heading"
      data-section="use-cases"
      className="scroll-mt-16 border-b border-line"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">
          {t.useCases.eyebrow}
        </p>
        <h2
          id="use-cases-heading"
          className="mt-3 max-w-[20ch] text-4xl leading-tight font-semibold text-ink sm:text-5xl"
        >
          {t.useCases.heading}
        </h2>
        <div className="use-case-grid mt-12" role="list">
          {USE_CASE_IDS.map((id, i) => (
            <div key={id} role="listitem" className="use-case-cell" data-cell={id}>
              <UseCaseTile id={id} index={i} t={t} />
            </div>
          ))}
        </div>
        <p
          className="use-case-counter mt-4 text-center font-mono text-xs text-ink-muted md:hidden"
          aria-hidden="true"
        >
          <span data-counter>1</span> / {USE_CASE_IDS.length}
        </p>
      </div>
      <UseCasesMotion />
    </section>
  );
}
