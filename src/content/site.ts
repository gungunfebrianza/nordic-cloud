/**
 * The brand name. Every visible use of the name reads this constant; never hard-code it elsewhere.
 */
export const BRAND = "Serperku";

/** Placeholder until the data-centre list is final. One constant, like BRAND (#how map, #security). */
export const DATACENTER_LOCATIONS = "{{DATACENTER_LOCATIONS}}";

/** Section anchors, in page order. Their landmark labels live in en.ts / da.ts. */
export const SECTION_IDS = [
  "hero",
  "products",
  "how",
  "use-cases",
  "security",
  "pricing",
  "faq",
  "cta",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
