// Lighthouse mobile run against the static export, failing on the budget in CLAUDE.md.
// Run `npm run build` first. Set CHROME_PATH to use a specific Chrome/Chromium.
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const PORT = 4174;
const URL = `http://localhost:${PORT}/`;
const RUNS = 3;

const SCORE_MIN = { performance: 90, accessibility: 95, "best-practices": 95, seo: 95 };
const METRIC_MAX = { lcpMs: 2000, cls: 0.05, tbtMs: 200 };

const server = spawn(process.execPath, ["scripts/serve.mjs", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH || undefined,
  chromeFlags: ["--headless=new", "--no-sandbox"],
});

const runs = [];
try {
  for (let i = 0; i < RUNS; i++) {
    // Default config = mobile emulation + simulated slow 4G throttling.
    const { lhr, report } = await lighthouse(URL, {
      port: chrome.port,
      output: "html",
      logLevel: "error",
    });
    runs.push(lhr);
    if (i === RUNS - 1) {
      await mkdir(".lighthouse", { recursive: true });
      await writeFile(".lighthouse/report.html", report);
    }
  }
} finally {
  await chrome.kill();
  server.kill();
}

// Report the median run by performance score.
runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score);
const lhr = runs[Math.floor(runs.length / 2)];
const score = (k) => Math.round(lhr.categories[k].score * 100);
const audit = (k) => lhr.audits[k].numericValue;

const result = {
  performance: score("performance"),
  accessibility: score("accessibility"),
  "best-practices": score("best-practices"),
  seo: score("seo"),
  lcpMs: Math.round(audit("largest-contentful-paint")),
  cls: Number(audit("cumulative-layout-shift").toFixed(3)),
  tbtMs: Math.round(audit("total-blocking-time")), // lab proxy for INP
  fcpMs: Math.round(audit("first-contentful-paint")),
};
console.log(JSON.stringify(result, null, 2));
await writeFile(".lighthouse/summary.json", JSON.stringify(result, null, 2));

const fails = [];
for (const [k, min] of Object.entries(SCORE_MIN))
  if (result[k] < min) fails.push(`${k} ${result[k]} < ${min}`);
for (const [k, max] of Object.entries(METRIC_MAX))
  if (result[k] > max) fails.push(`${k} ${result[k]} > ${max}`);
if (fails.length) {
  console.error(`✗ Lighthouse budget: ${fails.join(", ")}`);
  process.exit(1);
}
console.log("✓ Lighthouse budget met");
