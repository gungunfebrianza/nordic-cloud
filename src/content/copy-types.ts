/**
 * The shape of every visible string on the site. en.ts and da.ts each export one `Copy`, so the
 * build fails if a language misses a string. Non-copy (BRAND, placeholder constants, demo values,
 * prices, ids, hrefs, the agent.yaml sample, mono log lines) lives elsewhere in src/content/.
 */
import type { FaqId } from "./faq";
import type { ProductId } from "./products";
import type { SecurityBlockId } from "./security";
import type { SectionId } from "./site";
import type { UseCaseId } from "./use-cases";

export type Locale = "en" | "da";

type Three = readonly [string, string, string];

export type Copy = {
  locale: Locale;
  /** BCP 47 tag for Intl number formatting. */
  intl: string;
  meta: {
    tagline: string;
    description: string;
    ogLocale: string;
  };
  common: {
    skipToContent: string;
    /** Tooltip on the "demo" tag. */
    demoTitle: string;
    demoTag: string;
    /** Tooltip on a {{PLACEHOLDER}} chip. */
    placeholderTitle: string;
    /** Tooltip on a {{CONFIRM}} chip. */
    confirmTitle: string;
    /** Label of the EN · DA switch (nav landmark). */
    languageLabel: string;
    languageNames: Record<Locale, string>;
  };
  /** Landmark labels, one per section. */
  sections: Record<SectionId, string>;
  nav: {
    label: string;
    home: string;
    items: readonly { label: string; href: string }[];
    talk: string;
    deploy: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    chipSuffix: string;
    headline: string;
    sub: string;
    primaryCta: string;
    secondaryCta: string;
    trustLabel: string;
    trust: Three;
    networkLabel: string;
  };
  products: {
    eyebrow: string;
    heading: string;
    items: Record<ProductId, { title: string; line: string; bullets: Three; caption: string }>;
    from: string;
    perMonth: string;
    explore: string;
    compare: string;
    compareFeature: string;
    /** Placeholder rows: Haze fills these in. One cell per product, in PRODUCT_IDS order. */
    compareRows: readonly { label: string; cells: Three }[];
  };
  how: {
    eyebrow: string;
    heading: string;
    steps: readonly { n: 1 | 2 | 3 | 4; title: string; body: string }[];
    running: (agents: number) => string;
    uptime: string;
    heartbeat: string;
    filmSoon: string;
    filmCaption: (brand: string) => string;
    filmCaptionsAvailable: string;
    filmPlay: (brand: string) => string;
    /** Label of the captions track. */
    captionsLabel: string;
  };
  useCases: {
    eyebrow: string;
    heading: string;
    items: Record<UseCaseId, { name: string; outcome: string; jobs: Three }>;
    playbook: string;
    play: (name: string) => string;
    pause: (name: string) => string;
  };
  security: {
    eyebrow: string;
    heading: string;
    intro: string;
    /** Draft claims, each followed by {{CONFIRM}}. */
    blocks: Record<SecurityBlockId, { title: string; body: string }>;
    shieldLabel: string;
    logTitle: string;
    statusTitle: string;
    statusLink: string;
    statusSummary: (days: number, ok: number, degraded: number) => string;
    daysAgo: (days: number) => string;
    today: string;
    certifications: string;
  };
  pricing: {
    eyebrow: string;
    heading: string;
    intro: string;
    /** Legends of the three toggles. */
    billing: string;
    currency: string;
    vat: string;
    monthly: string;
    annual: string;
    /** Toggle options for VAT. */
    vatExclOption: string;
    vatInclOption: string;
    /** Notes under the price. */
    billedMonthly: string;
    billedAnnually: string;
    vatExcl: string;
    vatIncl: string;
    perMonth: string;
    cta: string;
    /** Included items per tier; tier names come from products.items. */
    tiers: Record<ProductId, { line: string; includes: readonly string[] }>;
    /** Spoken once after a toggle, with the final prices. */
    announce: (prices: string) => string;
  };
  faq: {
    eyebrow: string;
    heading: string;
    /** One per FAQ_IDS entry. Claims are followed by {{CONFIRM}}. */
    items: Record<FaqId, { q: string; a: string; link?: { label: string; href: string } }>;
  };
  cta: {
    heading: string;
    sub: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    sending: string;
    /** Inline errors. */
    invalid: string;
    failed: string;
    success: string;
    privacyNote: string;
    privacyLink: string;
  };
  footer: {
    location: string;
  };
  notFound: {
    title: string;
    body: string;
    home: string;
  };
};
