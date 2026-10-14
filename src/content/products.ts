/**
 * #products non-copy. Prices are placeholders: one constant each, never invented.
 * Titles, lines and bullets live in en.ts / da.ts.
 */
export const PRICE_BOTS = "{{PRICE_BOTS}}";
export const PRICE_VPS = "{{PRICE_VPS}}";
export const PRICE_CLUSTERS = "{{PRICE_CLUSTERS}}";

export const PRODUCT_IDS = ["bots", "vps", "clusters"] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export const PRODUCT_PRICE: Record<ProductId, string> = {
  bots: PRICE_BOTS,
  vps: PRICE_VPS,
  clusters: PRICE_CLUSTERS,
};

// TODO: point at the product pages once they exist.
export const PRODUCT_HREF: Record<ProductId, string> = {
  bots: "#pricing",
  vps: "#pricing",
  clusters: "#pricing",
};
