/**
 * The brand name. Deliberately a placeholder until the name is final.
 * Every visible use of the name reads this constant; never hard-code a name elsewhere.
 */
export const BRAND = "{{BRAND}}";

export const TAGLINE = "Agents that never clock out.";

export const DESCRIPTION =
  "A Copenhagen-based, EU-hosted cloud for always-on AI agents: always-on bots, agent VPS and multi-agent clusters.";

/** Section anchors, in page order. */
export const SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "how", label: "How it works" },
  { id: "use-cases", label: "Use cases" },
  { id: "security", label: "Security" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Get started" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export type NavItem = { label: string; href: string };

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Products", href: "#products" },
  { label: "Use cases", href: "#use-cases" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  // TODO: point at the docs site once it exists.
  { label: "Docs", href: "#" },
];

export const NAV_ACTIONS = {
  secondary: { label: "Talk to us", href: "#cta" },
  primary: { label: "Deploy an agent", href: "#cta" },
} as const;
