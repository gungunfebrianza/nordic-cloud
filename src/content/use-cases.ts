/**
 * #use-cases copy, from Haze's brief. Every number in a job is a demo() value from demo.ts.
 */
import { DEMO } from "./demo";

export type UseCaseId =
  "economy" | "finance" | "security" | "banking" | "programming" | "blockchain";

export type UseCase = {
  id: UseCaseId;
  name: string;
  outcome: string;
  jobs: readonly [string, string, string];
  /** True when a job shows a demo figure; the tile shows a DemoTag. */
  demo: boolean;
  href: string;
};

export const USE_CASES_EYEBROW = "Use cases";
export const USE_CASES_HEADING = "Always on, wherever the work never stops.";

const fmt = (n: number) => n.toLocaleString("en-US");

// TODO: point each vertical at its playbook page once it exists.
const HREF_ECONOMY = "#cta";
const HREF_FINANCE = "#cta";
const HREF_SECURITY = "#cta";
const HREF_BANKING = "#cta";
const HREF_PROGRAMMING = "#cta";
const HREF_BLOCKCHAIN = "#cta";

export const USE_CASES: readonly UseCase[] = [
  {
    id: "economy",
    name: "Economy",
    outcome: "Agents that model markets while they move.",
    jobs: [
      `ingest ${fmt(DEMO.economyFeeds.value)} feeds`,
      "rerun forecasts hourly",
      "flag regime shifts",
    ],
    demo: true,
    href: HREF_ECONOMY,
  },
  {
    id: "finance",
    name: "Finance",
    outcome: "Reconciliation that runs at 3 a.m., not at month-end.",
    jobs: [
      `match ${fmt(DEMO.financeInvoices.value)} invoices`,
      `flag ${fmt(DEMO.financeAnomalies.value)} anomalies`,
      "draft the close note",
    ],
    demo: true,
    href: HREF_FINANCE,
  },
  {
    id: "security",
    name: "Security",
    outcome: "Threat hunting that never takes a shift off.",
    jobs: ["triage alerts", "trace anomalous egress", "open the incident"],
    demo: false,
    href: HREF_SECURITY,
  },
  {
    id: "banking",
    name: "Banking",
    outcome: "Compliance checks on every transaction, in real time.",
    jobs: ["screen payments", "refresh KYC", "route edge cases to a human"],
    demo: false,
    href: HREF_BANKING,
  },
  {
    id: "programming",
    name: "Programming",
    outcome: "Code review, tests and fixes, around the clock.",
    jobs: ["review PRs", "run test suites", "ship a fix behind a flag"],
    demo: false,
    href: HREF_PROGRAMMING,
  },
  {
    id: "blockchain",
    name: "Blockchain",
    outcome: "On-chain monitoring, every block, every chain.",
    jobs: ["watch contracts", "trace large transfers", "alert on anomalies"],
    demo: false,
    href: HREF_BLOCKCHAIN,
  },
];
