/**
 * #use-cases non-copy: tile order, playbook links and which tiles show a demo figure.
 * Names, outcome lines and jobs live in en.ts / da.ts; their numbers are demo() values in demo.ts.
 */
export const USE_CASE_IDS = [
  "economy",
  "finance",
  "security",
  "banking",
  "programming",
  "blockchain",
] as const;
export type UseCaseId = (typeof USE_CASE_IDS)[number];

/** True when a job shows a demo figure; the tile shows a DemoTag. */
export const USE_CASE_DEMO: Record<UseCaseId, boolean> = {
  economy: true,
  finance: true,
  security: false,
  banking: false,
  programming: false,
  blockchain: false,
};

// TODO: point each vertical at its playbook page once it exists.
export const USE_CASE_HREF: Record<UseCaseId, string> = {
  economy: "#cta",
  finance: "#cta",
  security: "#cta",
  banking: "#cta",
  programming: "#cta",
  blockchain: "#cta",
};
