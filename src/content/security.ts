/**
 * #security non-copy. The blocks are DRAFTS (in en.ts / da.ts): every claim that needs legal or ops
 * sign-off is followed by {{CONFIRM}}, which renders on the page as a visible chip until removed.
 * Wording says "help you meet", never "compliant" or "certified".
 */
export const CONFIRM = "{{CONFIRM}}";

export const SECURITY_BLOCK_IDS = ["residency", "isolation", "resilience", "governance"] as const;
export type SecurityBlockId = (typeof SECURITY_BLOCK_IDS)[number];

/** Placeholder until the public status page exists. One constant, like BRAND. */
export const STATUS_URL = "{{STATUS_URL}}";

/** True for an unfilled {{PLACEHOLDER}} constant. */
export const isPlaceholder = (s: string) => /^\{\{[A-Z_]+\}\}$/.test(s);
