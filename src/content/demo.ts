/**
 * DEMO DATA. Every illustrative number shown on the site lives here and nowhere else.
 *
 * Nothing in this file is a real metric, customer or measurement. Each value is wrapped in
 * `demo()` so it carries a DEMO marker the UI can surface (e.g. a "demo" tag), and so a
 * grep for `DEMO` finds every invented figure before launch.
 */

export type Demo<T> = { readonly value: T; readonly DEMO: true; readonly note: string };

export function demo<T>(value: T, note: string): Demo<T> {
  return { value, DEMO: true, note };
}

export function isDemo(v: unknown): v is Demo<unknown> {
  return typeof v === "object" && v !== null && (v as { DEMO?: unknown }).DEMO === true;
}

/** Example values for the hero diagram and live-looking panels. Illustrative only. */
export const DEMO = {
  // TODO: wire a real endpoint for the live agent count and drop the demo() wrapper.
  agentsOnline: demo(2418, "Hero eyebrow chip: agents online now. Invented; drifts client-side."),
  agentsOnlineDrift: demo(
    { minStep: 1, maxStep: 6, minIntervalMs: 3000, maxIntervalMs: 5000, maxDeviation: 0.03 },
    "How the demo agent count wanders: ±1–6 every 3–5 s, never more than 3% from the start value.",
  ),
  queueDepth: demo(42, "Illustrative queue depth in the cluster diagram"),
} as const;

/**
 * Tooltip strings for the hero network. Names, activities and uptimes are invented.
 * Format: "<id> · <activity> · <status>".
 */
export const DEMO_NODE_LABELS = demo(
  {
    core: [
      "core-01 · scheduler · up 412 d",
      "core-02 · shared memory · up 412 d",
      "core-03 · event bus · up 398 d",
    ],
    agent: [
      "agent-01 · screening payments · up 287 d",
      "agent-02 · watching FX rates · up 203 d",
      "agent-03 · triaging alerts · up 341 d",
      "agent-04 · reviewing pull requests · up 96 d",
      "agent-05 · indexing blocks · up 158 d",
      "agent-06 · forecasting liquidity · up 221 d",
      "agent-07 · reconciling ledger · up 312 d",
      "agent-08 · scanning CVE feeds · up 177 d",
      "agent-09 · rebalancing portfolio · up 64 d",
      "agent-10 · parsing invoices · up 249 d",
      "agent-11 · settling transfers · up 133 d",
      "agent-12 · auditing access logs · up 305 d",
    ],
    task: [
      "task-4471 · queued",
      "task-4472 · running · 0.4 s",
      "task-4473 · done · 1.1 s",
      "task-4474 · running · 2.3 s",
      "task-4475 · queued",
      "task-4476 · done · 0.8 s",
    ],
  },
  "Hero network tooltips. Invented names, activities and uptimes.",
);
