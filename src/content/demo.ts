/**
 * DEMO DATA. Every illustrative number shown on the site lives here and nowhere else.
 *
 * Nothing in this file is a real metric, customer or measurement. Each value is wrapped in
 * `demo()` so it carries a DEMO marker the UI can surface (e.g. a "Demo data" label), and so a
 * grep for `DEMO` finds every invented figure before launch.
 */

export type Demo<T> = { readonly value: T; readonly DEMO: true; readonly note: string };

export function demo<T>(value: T, note: string): Demo<T> {
  return { value, DEMO: true, note };
}

/** Example values for the hero diagram and live-looking panels. Illustrative only. */
export const DEMO = {
  agentsOnline: demo(128, "Illustrative count of running agents in the hero diagram"),
  heartbeatsPerMinute: demo(25, "60 000 ms / 2400 ms heartbeat, shown in the uptime dial"),
  queueDepth: demo(42, "Illustrative queue depth in the cluster diagram"),
} as const;
