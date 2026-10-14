/**
 * #products non-copy. Titles, lines and bullets live in en.ts / da.ts. The "from" price on each
 * card reads src/content/pricing.ts (monthly, in the page's default currency).
 */

export const PRODUCT_IDS = ["bots", "vps", "clusters"] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

// TODO: point at the product pages once they exist.
export const PRODUCT_HREF: Record<ProductId, string> = {
  bots: "#pricing",
  vps: "#pricing",
  clusters: "#pricing",
};
