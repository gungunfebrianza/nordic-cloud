/**
 * #security copy, from Haze's brief. These are DRAFTS: every claim that needs legal or ops
 * sign-off is followed by {{CONFIRM}}, which renders on the page as a visible chip until removed.
 * Wording says "help you meet", never "compliant" or "certified".
 */
import { DATACENTER_LOCATIONS } from "./site";

export const CONFIRM = "{{CONFIRM}}";

export const SECURITY_EYEBROW = "Security";
export const SECURITY_HEADING = "Built for regulated work.";
export const SECURITY_INTRO =
  "Your agents touch money, code and customer data. So each one runs inside clear limits.";

export type SecurityBlockId = "residency" | "isolation" | "resilience" | "governance";

export type SecurityBlock = { id: SecurityBlockId; title: string; body: string };

export const SECURITY_BLOCKS: readonly SecurityBlock[] = [
  {
    id: "residency",
    title: "EU data residency",
    body: `Compute and data stay in ${DATACENTER_LOCATIONS}. ${CONFIRM} Nothing is transferred outside the EU/EEA by default. ${CONFIRM}`,
  },
  {
    id: "isolation",
    title: "Isolation",
    body: `Every tenant gets its own VPS and containers. ${CONFIRM} Network policies limit what each agent can reach. ${CONFIRM} Secrets are managed for you, never kept in agent code. ${CONFIRM}`,
  },
  {
    id: "resilience",
    title: "Operational resilience",
    body: `Built for customers under DORA and NIS2. ${CONFIRM} Incident-reporting support, audit logs, data export and exit plans come as standard. ${CONFIRM}`,
  },
  {
    id: "governance",
    title: "AI governance",
    body: `Every agent action is logged. ${CONFIRM} Approval gates and human-in-the-loop controls help you meet your EU AI Act duties. ${CONFIRM}`,
  },
];

export const SHIELD_LABEL =
  "Diagram: a ring of sentinel agents around a vault, catching incoming alerts before they reach it.";
export const SHIELD_LOG_TITLE = "sentinel log";

export const STATUS_TITLE = "All systems operational";
export const STATUS_LINK_LABEL = "Status page";

/** Placeholder until the public status page exists. One constant, like BRAND. */
export const STATUS_URL = "{{STATUS_URL}}";

/** True for an unfilled {{PLACEHOLDER}} constant. */
export const isPlaceholder = (s: string) => /^\{\{[A-Z_]+\}\}$/.test(s);
