import type { Copy } from "@/content/copy-types";
import { BrandFilm } from "./BrandFilm";
import { CodePanel } from "./CodePanel";
import { Dashboard } from "./Dashboard";
import { NODE_PCT } from "./geometry";
import { HowScroll } from "./HowScroll";
import { Scene } from "./Scene";

/**
 * #how. Desktop: a sticky panel (left) shows one state per step and morphs as the steps on the
 * right scroll past; a lazy controller drives it with motion's useScroll. Mobile: each step
 * stacks with its own small visual. Everything here is server-rendered and complete without JS.
 */
export function How({ t }: { t: Copy }) {
  const how = t.how;
  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      data-section="how"
      className="scroll-mt-16 border-b border-line"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">{how.eyebrow}</p>
        <h2
          id="how-heading"
          className="mt-3 max-w-[22ch] text-4xl leading-tight font-semibold text-ink sm:text-5xl"
        >
          {how.heading}
        </h2>

        <div className="how-layout mt-12 lg:mt-0">
          <div className="how-panel-col">
            <div
              className="how-panel how-stage"
              data-step="1"
              aria-hidden="true"
              style={{ "--node-x": NODE_PCT.x, "--node-y": NODE_PCT.y } as React.CSSProperties}
            >
              <div className="how-panel-frame">
                <Scene uid="how-panel" />
                <CodePanel />
                <Dashboard t={t} />
              </div>
              <div className="how-rail">
                <div className="how-rail-track">
                  <div className="how-rail-fill" />
                </div>
                <ol className="how-rail-steps">
                  {how.steps.map((s) => (
                    <li key={s.n} data-n={s.n}>
                      0{s.n} {s.title}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <ol className="how-steps">
            {how.steps.map((s) => (
              <li key={s.n} className="how-step" data-n={s.n}>
                <div className="how-step-text">
                  <p className="font-mono text-xs text-signal">0{s.n}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{s.title}</h3>
                  <p className="mt-3 max-w-[42ch] text-[17px] leading-relaxed text-ink-muted">
                    {s.body}
                  </p>
                </div>
                <div className="how-visual how-stage" data-step={s.n} aria-hidden="true">
                  {s.n === 1 ? (
                    <CodePanel />
                  ) : s.n === 4 ? (
                    <Dashboard t={t} />
                  ) : (
                    <div className="how-panel-frame">
                      <Scene uid={`how-step-${s.n}`} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <BrandFilm t={t} />
      </div>
      <HowScroll />
    </section>
  );
}
