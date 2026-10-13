// Lighthouse mobile runs against the static export, failing on the budget in CLAUDE.md.
// Run `npm run build` first. Set CHROME_PATH to use a specific Chrome/Chromium.
//
// Two throttling modes, 3 runs each (median reported):
//   simulated: Lighthouse's default (Lantern). Estimates throttled 4G from an unthrottled load.
//              This is what PageSpeed Insights shows. Gates the four category scores.
//   devtools:  actually throttles the network (150 ms RTT, 1.6 Mbps) and CPU (4x) and observes.
//              Gates LCP / CLS / TBT, since the budget is "LCP < 2.0 s on throttled 4G".
// Both are printed so neither number hides the other.
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

const runsByMode = { simulated: [], devtools: [] };
try {
  for (const mode of Object.keys(runsByMode)) {
    for (let i = 0; i < RUNS; i++) {
      const { lhr, report } = await lighthouse(URL, {
        port: chrome.port,
        output: "html",
        logLevel: "error",
        ...(mode === "devtools" ? { throttlingMethod: "devtools" } : {}),
      });
      runsByMode[mode].push(lhr);
      if (i === RUNS - 1) {
        await mkdir(".lighthouse", { recursive: true });
        await writeFile(`.lighthouse/report-${mode}.html`, report);
      }
    }
  }
} finally {
  await chrome.kill();
  server.kill();
}

const summarise = (runs) => {
  // Median run by performance score.
  runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score);
  const lhr = runs[Math.floor(runs.length / 2)];
  const score = (k) => Math.round(lhr.categories[k].score * 100);
  const audit = (k) => lhr.audits[k].numericValue;
  return {
    performance: score("performance"),
    accessibility: score("accessibility"),
    "best-practices": score("best-practices"),
    seo: score("seo"),
    lcpMs: Math.round(audit("largest-contentful-paint")),
    cls: Number(audit("cumulative-layout-shift").toFixed(3)),
    tbtMs: Math.round(audit("total-blocking-time")), // lab proxy for INP
    fcpMs: Math.round(audit("first-contentful-paint")),
  };
};

const simulated = summarise(runsByMode.simulated);
const devtools = summarise(runsByMode.devtools);
const result = { simulated, devtools };
console.log(JSON.stringify(result, null, 2));
await writeFile(".lighthouse/summary.json", JSON.stringify(result, null, 2));

const fails = [];
for (const [k, min] of Object.entries(SCORE_MIN)) {
  if (simulated[k] < min) fails.push(`simulated ${k} ${simulated[k]} < ${min}`);
  if (devtools[k] < min) fails.push(`devtools ${k} ${devtools[k]} < ${min}`);
}
for (const [k, max] of Object.entries(METRIC_MAX)) {
  if (devtools[k] > max) fails.push(`devtools ${k} ${devtools[k]} > ${max}`);
}
if (simulated.lcpMs > METRIC_MAX.lcpMs) {
  console.warn(
    `! simulated LCP estimate ${simulated.lcpMs} ms is over ${METRIC_MAX.lcpMs} ms (see CLAUDE.md)`,
  );
}
if (fails.length) {
  console.error(`✗ Lighthouse budget: ${fails.join(", ")}`);
  process.exit(1);
}
console.log("✓ Lighthouse budget met");
