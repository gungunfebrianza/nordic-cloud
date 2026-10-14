import { ChevronDown } from "lucide-react";
import { WithPlaceholders } from "@/components/ui/WithPlaceholders";
import type { Copy } from "@/content/copy-types";
import { FAQ_IDS } from "@/content/faq";
import { FaqToggle } from "./FaqToggle";

/**
 * Eight questions. Each is a real button (aria-expanded, aria-controls) over a region that opens
 * with height + fade (faq.css). All start closed; several can be open. FaqToggle only flips the
 * attributes. Without JS, a noscript style shows every answer. No FAQ structured data.
 */
export function Faq({ t }: { t: Copy }) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      data-section="faq"
      className="scroll-mt-16 border-b border-line"
    >
      <noscript>
        <style>{`.faq-a{grid-template-rows:1fr!important;opacity:1!important}.faq-inner{visibility:visible!important}.faq-chev{display:none}`}</style>
      </noscript>
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <div className="faq-layout">
          <div>
            <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">
              {t.faq.eyebrow}
            </p>
            <h2
              id="faq-heading"
              className="mt-3 max-w-[14ch] text-4xl leading-tight font-semibold text-ink sm:text-5xl"
            >
              {t.faq.heading}
            </h2>
          </div>
          <div className="faq-list">
            {FAQ_IDS.map((id) => {
              const item = t.faq.items[id];
              return (
                <div key={id} className="faq-item" data-faq={id}>
                  <h3>
                    <button
                      type="button"
                      className="faq-q"
                      id={`faq-q-${id}`}
                      aria-expanded="false"
                      aria-controls={`faq-a-${id}`}
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        size={18}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="faq-chev"
                      />
                    </button>
                  </h3>
                  <div
                    className="faq-a"
                    id={`faq-a-${id}`}
                    role="region"
                    aria-labelledby={`faq-q-${id}`}
                  >
                    <div className="faq-inner">
                      <p>
                        <WithPlaceholders text={item.a} t={t.common} />
                        {item.link && (
                          <>
                            {" "}
                            <a href={item.link.href} className="font-medium text-signal">
                              {item.link.label} →
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <FaqToggle />
    </section>
  );
}
