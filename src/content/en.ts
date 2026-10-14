/**
 * English copy. Every visible string on / lives here; da.ts mirrors it for /da/.
 */
import type { Copy } from "./copy-types";
import { DEMO } from "./demo";
import { CONFIRM } from "./security";
import { DATACENTER_LOCATIONS } from "./site";

const fmt = (n: number) => n.toLocaleString("en-GB");

export const en: Copy = {
  locale: "en",
  intl: "en-GB",
  meta: {
    tagline: "Agents that never clock out.",
    description:
      "A Jakarta, Singapore and Copenhagen-based, EU-hosted cloud for always-on AI agents: always-on bots, agent VPS and multi-agent clusters.",
    ogLocale: "en_GB",
  },
  common: {
    skipToContent: "Skip to content",
    demoTitle: "Illustrative figure, not live data",
    demoTag: "demo",
    placeholderTitle: "Placeholder: value not final",
    confirmTitle: "Draft claim: needs legal or ops sign-off before launch",
    languageLabel: "Language",
    languageNames: { en: "English", da: "Dansk" },
  },
  sections: {
    hero: "Overview",
    products: "Products",
    how: "How it works",
    "use-cases": "Use cases",
    security: "Security",
    pricing: "Pricing",
    faq: "FAQ",
    cta: "Get started",
  },
  nav: {
    label: "Primary",
    home: "home",
    items: [
      { label: "Products", href: "#products" },
      { label: "Use cases", href: "#use-cases" },
      { label: "Security", href: "#security" },
      { label: "Pricing", href: "#pricing" },
      // TODO: point at the docs site once it exists.
      { label: "Docs", href: "#" },
    ],
    talk: "Talk to us",
    deploy: "Deploy an agent",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  hero: {
    chipSuffix: "agents online now",
    headline: "Agents that never clock out.",
    sub: "EU-hosted infrastructure for always-on AI agents — from one bot to coordinated multi-agent clusters. Built in Copenhagen.",
    primaryCta: "Deploy your first agent",
    secondaryCta: "See how it works",
    trustLabel: "Assurances",
    trust: ["Hosted in the EU", "GDPR by design", "Monitored 24/7"],
    networkLabel:
      "Illustration of an agent network: core nodes, agents and tasks linked together, with data packets moving between them and tasks being routed through agents to completion.",
  },
  products: {
    eyebrow: "Products",
    heading: "Three ways to run agents that never stop.",
    items: {
      bots: {
        title: "Always-on bots",
        line: "Single agents that run 24/7.",
        bullets: [
          "Scheduled, event-driven or webhook-triggered",
          "Automatic restarts and health checks",
          "Logs and traces for every run",
        ],
        caption: "cron · webhooks · queues",
      },
      vps: {
        title: "Agent VPS",
        line: "Dedicated servers, pre-built for agent runtimes.",
        bullets: ["Isolated VM per workload", "GPU optional", "Agent runtimes pre-installed"],
        caption: "cpu · gpu · isolated",
      },
      clusters: {
        title: "Multi-agent clusters",
        line: "Orchestrated teams of agents that share what they know.",
        bullets: [
          "Shared memory and queues",
          "One orchestrator, many agents",
          "Observability across the team",
        ],
        caption: "memory · queues · traces",
      },
    },
    from: "from",
    perMonth: "/mo",
    explore: "Explore",
    compare: "Compare plans",
    compareFeature: "Feature",
    compareRows: [1, 2, 3, 4, 5, 6].map((n) => ({
      label: `Row ${n} (placeholder)`,
      cells: ["—", "—", "—"] as const,
    })),
  },
  how: {
    eyebrow: "How it works",
    heading: "From prompt to production in four steps.",
    steps: [
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
    ],
    running: (n) => `running · ${n} agents`,
    uptime: "Uptime",
    heartbeat: "Heartbeat",
    filmSoon: "Film coming soon",
    filmCaption: (brand) => `The ${brand} film`,
    filmCaptionsAvailable: "captions available",
    filmPlay: (brand) => `Play the ${brand} film`,
    captionsLabel: "English",
  },
  useCases: {
    eyebrow: "Use cases",
    heading: "Always on, wherever the work never stops.",
    items: {
      economy: {
        name: "Economy",
        outcome: "Agents that model markets while they move.",
        jobs: [
          `ingest ${fmt(DEMO.economyFeeds.value)} feeds`,
          "rerun forecasts hourly",
          "flag regime shifts",
        ],
      },
      finance: {
        name: "Finance",
        outcome: "Reconciliation that runs at 3 a.m., not at month-end.",
        jobs: [
          `match ${fmt(DEMO.financeInvoices.value)} invoices`,
          `flag ${fmt(DEMO.financeAnomalies.value)} anomalies`,
          "draft the close note",
        ],
      },
      security: {
        name: "Security",
        outcome: "Threat hunting that never takes a shift off.",
        jobs: ["triage alerts", "trace anomalous egress", "open the incident"],
      },
      banking: {
        name: "Banking",
        outcome: "Compliance checks on every transaction, in real time.",
        jobs: ["screen payments", "refresh KYC", "route edge cases to a human"],
      },
      programming: {
        name: "Programming",
        outcome: "Code review, tests and fixes, around the clock.",
        jobs: ["review PRs", "run test suites", "ship a fix behind a flag"],
      },
      blockchain: {
        name: "Blockchain",
        outcome: "On-chain monitoring, every block, every chain.",
        jobs: ["watch contracts", "trace large transfers", "alert on anomalies"],
      },
    },
    playbook: "Read the playbook",
    play: (name) => `Play ${name} film`,
    pause: (name) => `Pause ${name} film`,
  },
  security: {
    eyebrow: "Security",
    heading: "Built for regulated work.",
    intro: "Your agents touch money, code and customer data. So each one runs inside clear limits.",
    blocks: {
      residency: {
        title: "EU data residency",
        body: `Compute and data stay in ${DATACENTER_LOCATIONS}. ${CONFIRM} Nothing is transferred outside the EU/EEA by default. ${CONFIRM}`,
      },
      isolation: {
        title: "Isolation",
        body: `Every tenant gets its own VPS and containers. ${CONFIRM} Network policies limit what each agent can reach. ${CONFIRM} Secrets are managed for you, never kept in agent code. ${CONFIRM}`,
      },
      resilience: {
        title: "Operational resilience",
        body: `Built for customers under DORA and NIS2. ${CONFIRM} Incident-reporting support, audit logs, data export and exit plans come as standard. ${CONFIRM}`,
      },
      governance: {
        title: "AI governance",
        body: `Every agent action is logged. ${CONFIRM} Approval gates and human-in-the-loop controls help you meet your EU AI Act duties. ${CONFIRM}`,
      },
    },
    shieldLabel:
      "Diagram: a ring of sentinel agents around a vault, catching incoming alerts before they reach it.",
    logTitle: "sentinel log",
    statusTitle: "All systems operational",
    statusLink: "Status page",
    statusSummary: (days, ok, degraded) =>
      `Demo data. Last ${days} days: ${ok} operational, ${degraded} degraded.`,
    daysAgo: (days) => `${days} days ago`,
    today: "Today",
    certifications: "Certifications",
  },
  pricing: {
    eyebrow: "Pricing",
    heading: "Clear prices, in euros or kroner.",
    intro: "Start with one agent. Move to a team when the work needs it.",
    billing: "Billing",
    currency: "Currency",
    vat: "VAT",
    monthly: "Monthly",
    annual: "Annual",
    vatExclOption: "excl. VAT",
    vatInclOption: "incl. 25% VAT",
    billedMonthly: "billed monthly",
    billedAnnually: "billed annually",
    vatExcl: "excl. VAT",
    vatIncl: "incl. 25% Danish VAT",
    perMonth: "/mo",
    cta: "Deploy an agent",
    tiers: {
      bots: {
        line: "Single agents that run 24/7.",
        includes: [
          "Scheduled, event-driven or webhook-triggered",
          "Automatic restarts and health checks",
          "Logs and traces for every run",
          "Hosted in the EU",
        ],
      },
      vps: {
        line: "Dedicated servers, pre-built for agent runtimes.",
        includes: [
          "Isolated VM per workload",
          "GPU optional",
          "Agent runtimes pre-installed",
          "Logs and traces for every run",
          "Hosted in the EU",
        ],
      },
      clusters: {
        line: "Orchestrated teams of agents that share what they know.",
        includes: [
          "One orchestrator, many agents",
          "Shared memory and queues",
          "Observability across the team",
          "Automatic restarts and health checks",
          "Hosted in the EU",
        ],
      },
    },
    announce: (prices) => `Prices updated. ${prices}`,
  },
  footer: {
    location: "Copenhagen, Denmark · EU-hosted",
  },
  notFound: {
    title: "Page not found",
    body: "This page doesn't exist. Your agents are still running.",
    home: "Back to the front page",
  },
};
