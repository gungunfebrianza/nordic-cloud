"use client";

import { useEffect, useState } from "react";
import { DEMO, isDemo } from "@/content/demo";

/**
 * Eyebrow chip: a live-green dot on the heartbeat and the agents-online count.
 *
 * The count is DEMO data (src/content/demo.ts) and is tagged "demo" on screen while it is.
 * TODO: wire a real endpoint; once the value is no longer wrapped in demo(), the tag disappears.
 */
export function AgentsOnlineChip({
  suffix,
  intl,
  demoLabel,
  demoTitle,
}: {
  suffix: string;
  /** BCP 47 tag for the number format (en-GB: 2,418; da-DK: 2.418). */
  intl: string;
  demoLabel: string;
  demoTitle: string;
}) {
  const format = new Intl.NumberFormat(intl);
  const source = DEMO.agentsOnline;
  const drift = DEMO.agentsOnlineDrift.value;
  const start = source.value;
  const [count, setCount] = useState(start);

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const delay =
        drift.minIntervalMs + Math.random() * (drift.maxIntervalMs - drift.minIntervalMs);
      timer = window.setTimeout(() => {
        setCount((c) => {
          const step =
            drift.minStep + Math.floor(Math.random() * (drift.maxStep - drift.minStep + 1));
          const next = c + (Math.random() < 0.5 ? -step : step);
          const limit = start * drift.maxDeviation;
          return Math.round(Math.min(start + limit, Math.max(start - limit, next)));
        });
        tick();
      }, delay);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [drift, start]);

  return (
    <p className="inline-flex items-center gap-2.5 rounded-pill border border-line bg-surface/70 py-1.5 pr-3 pl-2.5 text-sm text-ink-muted backdrop-blur-sm">
      <span className="relative inline-flex size-2" aria-hidden="true">
        <span className="absolute inset-0 animate-heartbeat rounded-pill bg-live" />
        <span className="relative size-2 rounded-pill bg-live" />
      </span>
      <span>
        <span className="font-mono font-medium text-ink tabular-nums" data-testid="agents-online">
          {format.format(count)}
        </span>{" "}
        {suffix}
      </span>
      {isDemo(source) && (
        <span
          className="rounded-[6px] border border-line px-1.5 font-mono text-[10px] tracking-wider text-ink-muted uppercase"
          title={demoTitle}
        >
          {demoLabel}
        </span>
      )}
    </p>
  );
}
