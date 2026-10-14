/**
 * #how non-copy: the agent config that types itself out in step 1. Fictional and illustrative,
 * and English in both languages. The heading and steps live in en.ts / da.ts; demo numbers
 * (uptime, log lines) live in demo.ts.
 */
export const AGENT_YAML = `# agent.yaml
name: ledger-reconciler
model: reasoning-large
description: Match card settlements to the ledger.
tools:
  - postgres.read
  - http.fetch
  - slack.notify
schedule:
  cron: "*/15 * * * *"
  timezone: Europe/Copenhagen
memory:
  kind: vector
  retention: 30d
guardrails:
  pii: redact
  max_spend_eur: 50
  require_approval: [payments.write]`;

export const AGENT_FILE = "agent.yaml";
export const AGENT_NAME = "ledger-reconciler";
