/**
 * #how copy: four steps from a config file to a watched, running team of agents.
 * The YAML is fictional and illustrative. Demo numbers (uptime, log lines) live in demo.ts.
 */

export const HOW_HEADING = "From prompt to production in four steps.";

/** Placeholder until the data-centre list is final. One constant, like BRAND. */
export const DATACENTER_LOCATIONS = "{{DATACENTER_LOCATIONS}}";

export type HowStep = { n: 1 | 2 | 3 | 4; title: string; body: string };

export const HOW_STEPS: readonly HowStep[] = [
  {
    n: 1,
    title: "Define",
    body: "Describe the agent in one file: the model it uses, the tools it may call, when it runs, what it remembers and the guardrails it must respect.",
  },
  {
    n: 2,
    title: "Deploy",
    body: "Push the file. We package the agent into an isolated container and place it on EU infrastructure. It stays up from then on.",
  },
  {
    n: 3,
    title: "Orchestrate",
    body: "Add agents and connect them. An orchestrator routes the work; the agents share memory and queues.",
  },
  {
    n: 4,
    title: "Observe",
    body: "Follow every run as it happens: streaming logs, traces, uptime and a heartbeat for each agent.",
  },
];

/** The agent config that types itself out in step 1. Fictional. */
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
