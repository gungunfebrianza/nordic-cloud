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
  howUptimeSeconds: demo(
    412 * 86_400 + 6 * 3_600 + 13 * 60 + 52,
    "#how dashboard: the agent's uptime when the panel first shows. Invented; counts up client-side.",
  ),
  howTeamSize: demo(5, "#how dashboard: agents in the example team"),
  economyFeeds: demo(214, "#use-cases Economy job: market feeds ingested. Invented."),
  financeInvoices: demo(41_203, "#use-cases Finance job: invoices matched. Invented."),
  financeAnomalies: demo(12, "#use-cases Finance job: anomalies flagged. Invented."),
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

/**
 * #how dashboard log stream. Invented. The panel shows the first 9, then appends one line per
 * heartbeat, cycling through the list. Times start at `start` and advance 2.4 s per line.
 */
export const DEMO_HOW_LOGS = demo(
  {
    start: "09:41:12",
    lines: [
      ["info", "run 18231 started · trigger cron"],
      ["info", "postgres.read settlements · 1,204 rows"],
      ["info", "matched 1,198 · flagged 6"],
      ["warn", "flagged 6 → approval queue"],
      ["info", "slack.notify #finance-ops · sent"],
      ["info", "run 18231 done · 3.8 s"],
      ["info", "heartbeat ok · 5/5 agents"],
      ["info", "fx-watcher → ledger-reconciler · 2 msgs"],
      ["info", "memory.write recon/2026-10 · 6 keys"],
      ["info", "trace 7f3a… closed · 11 spans"],
      ["info", "heartbeat ok · 5/5 agents"],
      ["info", "queue settlements · depth 0"],
    ] as const satisfies readonly (readonly ["info" | "warn", string])[],
  },
  "#how dashboard log lines. Invented run ids, counts and timings.",
);

/**
 * #security shield log. Invented events. One line per heartbeat, each matching the alert packet
 * the ring has just caught. `sentinel` is the 0-based index of the sentinel on the ring
 * (0 = top, clockwise), shown as sentinel-01…08.
 */
export const DEMO_SECURITY_LOG = demo(
  [
    { sentinel: 2, threat: "anomalous egress" },
    { sentinel: 5, threat: "credential stuffing" },
    { sentinel: 0, threat: "unsigned webhook" },
    { sentinel: 6, threat: "prompt injection" },
  ] as const,
  "#security shield log. Invented events; no real traffic.",
);

/**
 * #security status widget: 90 days, oldest first. Invented until the strip is wired to a real
 * status source. One degraded day so the strip visibly means something.
 */
export const DEMO_UPTIME_90D = demo(
  Array.from({ length: 90 }, (_, i) => (i === 52 ? "degraded" : "operational")) as readonly (
    "operational" | "degraded"
  )[],
  "#security status strip. Invented: 89 operational days, 1 degraded.",
);
