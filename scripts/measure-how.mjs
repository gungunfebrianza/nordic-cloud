// Measures #how: the lazy useScroll controller chunk(s) (gzipped) and frame rate while scrolling
// through the four steps and with each state's loops running. Run `npm run build` first.
// CHROME_PATH selects a specific Chromium. Headless sandbox numbers are indicative only.
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";
import { chromium } from "@playwright/test";

const PORT = 4180;
const BASE = `http://localhost:${PORT}`;
const server = spawn(process.execPath, ["scripts/serve.mjs", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

const pct = (arr, p) => [...arr].sort((a, b) => a - b)[Math.floor((p / 100) * arr.length)] ?? 0;
const toStep = (page, n) =>
  page.evaluate((n) => {
    const r = document.querySelector(`.how-step[data-n="${n}"]`).getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + r.top + r.height / 2 - innerHeight / 2,
      behavior: "instant",
    });
  }, n);

async function frames(page, ms, during) {
  const p = page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const out = [];
        const t0 = performance.now();
        const f = (t) => {
          out.push(t);
          if (t - t0 < ms) requestAnimationFrame(f);
          else resolve(out);
        };
        requestAnimationFrame(f);
      }),
    ms,
  );
  if (during) await during();
  const fr = await p;
  const iv = fr.slice(1).map((f, i) => f - fr[i]);
  return {
    fps: +((fr.length - 1) / ((fr.at(-1) - fr[0]) / 1000)).toFixed(1),
    p95FrameMs: +pct(iv, 95).toFixed(1),
    over20msPct: +((iv.filter((v) => v > 20).length / iv.length) * 100).toFixed(1),
  };
}

try {
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    const lazy = [];
    page.on("response", (res) => res.request().resourceType() === "script" && lazy.push(res));
    await page.locator("#how").scrollIntoViewIfNeeded();
    await page.waitForSelector('#how[data-scroll="how-scroll"]');
    let raw = 0;
    let gz = 0;
    for (const res of lazy) {
      const body = await res.body();
      raw += body.length;
      gz += gzipSync(body, { level: 9 }).length;
    }
    console.log(
      "Lazy #how controller chunk(s):",
      JSON.stringify({
        files: lazy.map((r) => r.url().replace(BASE, "")),
        rawKB: +(raw / 1024).toFixed(1),
        gzipKB: +(gz / 1024).toFixed(1),
      }),
    );
    await page.close();
  }

  for (const throttle of [1, 4]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await page.locator("#how").scrollIntoViewIfNeeded();
    await page.waitForSelector('#how[data-scroll="how-scroll"]');
    if (throttle > 1) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
    }
    const label = `1440×900 @2x, ${throttle === 1 ? "no throttle" : `${throttle}× CPU`}`;
    // Scrolling through all four steps with the wheel (native scroll, morphs firing).
    await toStep(page, 1);
    await page.waitForTimeout(500);
    await page.mouse.move(1000, 450);
    const scroll = await frames(page, 4000, async () => {
      for (let i = 0; i < 28; i++) {
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(120);
      }
    });
    console.log(JSON.stringify({ label, scenario: "wheel-scroll steps 1→4", ...scroll }));
    for (const n of [3, 4]) {
      await toStep(page, n);
      await page.waitForTimeout(1500);
      console.log(
        JSON.stringify({ label, scenario: `step ${n} loops`, ...(await frames(page, 5000)) }),
      );
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
