import { Activity, Globe, ShieldCheck } from "lucide-react";
import { HERO } from "@/content/hero";
import { AgentsOnlineChip } from "./AgentsOnlineChip";
import { NetworkSnapshot } from "./NetworkSnapshot";
import { NetworkStage } from "./NetworkStage";

const ICONS = { globe: Globe, shield: ShieldCheck, activity: Activity } as const;

export function Hero() {
  const words = HERO.headline.split(" ");
  return (
    <section
      id="hero"
      aria-label="Overview"
      data-section="hero"
      className="hero relative scroll-mt-16 overflow-hidden border-b border-line"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-5 pt-14 pb-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:pt-20 lg:pb-24">
        <div className="relative z-10 lg:col-span-5">
          <AgentsOnlineChip suffix={HERO.chipSuffix} />

          <h1 className="mt-6 text-[2.75rem] leading-[1.02] font-bold text-ink sm:text-6xl lg:text-[4.25rem]">
            {words.map((word, i) => (
              <span key={i}>
                <span className="hero-word" style={{ "--i": i } as React.CSSProperties}>
                  {word}
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-muted">{HERO.sub}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={HERO.primaryCta.href} className="hero-cta hero-cta--primary">
              {HERO.primaryCta.label}
            </a>
            <a href={HERO.secondaryCta.href} className="hero-cta hero-cta--ghost">
              {HERO.secondaryCta.label}
            </a>
          </div>

          <ul
            className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted"
            aria-label="Assurances"
          >
            {HERO.trust.map(({ icon, label }) => {
              const Icon = ICONS[icon];
              return (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Icon size={15} strokeWidth={1.5} aria-hidden="true" className="text-ink" />
                  {label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative lg:col-span-7">
          <div className="hero-glow" aria-hidden="true" />
          <NetworkStage label={HERO.networkLabel}>
            <NetworkSnapshot />
          </NetworkStage>
        </div>
      </div>
    </section>
  );
}
