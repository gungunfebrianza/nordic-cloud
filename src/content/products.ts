/**
 * #products copy. Prices are placeholders: one constant each, never invented.
 */
export const PRICE_BOTS = "{{PRICE_BOTS}}";
export const PRICE_VPS = "{{PRICE_VPS}}";
export const PRICE_CLUSTERS = "{{PRICE_CLUSTERS}}";

export type ProductId = "bots" | "vps" | "clusters";

export type Product = {
  id: ProductId;
  title: string;
  line: string;
  bullets: readonly [string, string, string];
  caption: string;
  price: string;
  href: string;
};

export const PRODUCTS_HEADING = "Three ways to run agents that never stop.";

export const PRODUCTS: readonly Product[] = [
  {
    id: "bots",
    title: "Always-on bots",
    line: "Single agents that run 24/7.",
    bullets: [
      "Scheduled, event-driven or webhook-triggered",
      "Automatic restarts and health checks",
      "Logs and traces for every run",
    ],
    caption: "cron · webhooks · queues",
    price: PRICE_BOTS,
    // TODO: point at the product page once it exists.
    href: "#pricing",
  },
  {
    id: "vps",
    title: "Agent VPS",
    line: "Dedicated servers, pre-built for agent runtimes.",
    bullets: ["Isolated VM per workload", "GPU optional", "Agent runtimes pre-installed"],
    caption: "cpu · gpu · isolated",
    price: PRICE_VPS,
    href: "#pricing",
  },
  {
    id: "clusters",
    title: "Multi-agent clusters",
    line: "Orchestrated teams of agents that share what they know.",
    bullets: [
      "Shared memory and queues",
      "One orchestrator, many agents",
      "Observability across the team",
    ],
    caption: "memory · queues · traces",
    price: PRICE_CLUSTERS,
    href: "#pricing",
  },
];

/** Compare table. PLACEHOLDER rows: Haze fills these in. One cell per product, in PRODUCTS order. */
export const COMPARE_ROWS: readonly { label: string; cells: readonly [string, string, string] }[] =
  [
    { label: "Row 1 (placeholder)", cells: ["—", "—", "—"] },
    { label: "Row 2 (placeholder)", cells: ["—", "—", "—"] },
    { label: "Row 3 (placeholder)", cells: ["—", "—", "—"] },
    { label: "Row 4 (placeholder)", cells: ["—", "—", "—"] },
    { label: "Row 5 (placeholder)", cells: ["—", "—", "—"] },
    { label: "Row 6 (placeholder)", cells: ["—", "—", "—"] },
  ];

export const COMPARE_LABEL = "Compare plans";
