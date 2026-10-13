// Measures the hero canvas: lazy chunk size (gzipped) and frame rate.
// Run `npm run build` first. CHROME_PATH selects a specific Chromium.
//
// Frame rate is measured in headless Chromium for 10 s per scenario while the pointer sweeps
// across the network (so drift and hover work are included). "4× CPU" uses DevTools CPU
// throttling as a stand-in for a mid-range laptop. Numbers from a cloud sandbox are indicative,
// not a substitute for a real device.
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";
import { chromium } from "@playwright/test";

const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const SECONDS = 10;

const server = spawn(process.execPath, ["scripts/serve.mjs", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

const pct = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))] ?? 0;
};

async function chunkSize() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const initial = new Set();
  const lazy = [];
  let loaded = false;
  page.on("load", () => (loaded = true));
  page.on("response", async (res) => {
    if (res.request().resourceType() !== "script") return;
    if (!loaded) initial.add(res.url());
    else lazy.push(res);
  });
  await page.goto(BASE);
  await page.waitForSelector('.hero-stage[data-state="live"]', { timeout: 15000 });
  let raw = 0;
  let gz = 0;
  const files = [];
  for (const res of lazy) {
    if (initial.has(res.url())) continue;
    const body = await res.body();
    raw += body.length;
    gz += gzipSync(body, { level: 9 }).length;
    files.push(res.url().replace(BASE, ""));
  }
  await page.close();
  return { files, rawKB: +(raw / 1024).toFixed(1), gzipKB: +(gz / 1024).toFixed(1) };
}

async function fps({ label, width, height, dpr, throttle }) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__HERO_STATS__ = { frames: [], drawMs: [] };
  });
  await page.goto(BASE);
  await page.waitForSelector('.hero-stage[data-state="live"]', { timeout: 15000 });
  if (throttle > 1) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
  }
  const box = await page.locator(".hero-canvas").boundingBox();
  await page.evaluate(() => {
    window.__HERO_STATS__.frames.length = 0;
    window.__HERO_STATS__.drawMs.length = 0;
  });
  const start = Date.now();
  let i = 0;
  while (Date.now() - start < SECONDS * 1000) {
    const t = i++ / 40;
    await page.mouse.move(
      box.x + box.width * (0.5 + 0.4 * Math.cos(t)),
      box.y + box.height * (0.5 + 0.4 * Math.sin(t * 1.3)),
    );
    await page.waitForTimeout(50);
  }
  const { frames, drawMs } = await page.evaluate(() => window.__HERO_STATS__);
  await ctx.close();
  const intervals = frames.slice(1).map((f, k) => f - frames[k]);
  const elapsed = (frames.at(-1) - frames[0]) / 1000;
  return {
    label,
    fps: +((frames.length - 1) / elapsed).toFixed(1),
    p95FrameMs: +pct(intervals, 95).toFixed(1),
    over20msPct: +((intervals.filter((v) => v > 20).length / intervals.length) * 100).toFixed(1),
    drawMsAvg: +(drawMs.reduce((s, v) => s + v, 0) / drawMs.length).toFixed(2),
    drawMsP95: +pct(drawMs, 95).toFixed(2),
  };
}

try {
  const chunk = await chunkSize();
  console.log("Lazy canvas chunk(s):", JSON.stringify(chunk));
  const runs = [
    { label: "1440×900 @2x, no throttle", width: 1440, height: 900, dpr: 2, throttle: 1 },
    { label: "1440×900 @2x, 4× CPU", width: 1440, height: 900, dpr: 2, throttle: 4 },
    { label: "390×844 @2x, 4× CPU", width: 390, height: 844, dpr: 2, throttle: 4 },
  ];
  for (const r of runs) console.log(JSON.stringify(await fps(r)));
} finally {
  await browser.close();
  server.kill();
}
