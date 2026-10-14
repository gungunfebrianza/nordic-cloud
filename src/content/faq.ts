/**
 * #faq non-copy: question order and the placeholders the answers use. Questions and answers live
 * in en.ts / da.ts; every claim there is followed by {{CONFIRM}} until legal or ops signs it off.
 * No FAQ structured data, on purpose.
 */
export const FAQ_IDS = [
  "sla",
  "data",
  "gpu",
  "frameworks",
  "keys",
  "limits",
  "access",
  "migrate",
] as const;
export type FaqId = (typeof FAQ_IDS)[number];

/** Monthly uptime commitment, e.g. "99.9%". One constant, like BRAND. */
export const SLA_PERCENT = "{{SLA_PERCENT}}";

/** Default per-workspace limits, e.g. "50 agents and 8 vCPU". One constant, like BRAND. */
export const LIMITS = "{{LIMITS}}";
