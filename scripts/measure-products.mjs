// Measures #products: the lazy motion chunk size (gzipped) and frame rate with all three
// diagrams running. Run `npm run build` first. CHROME_PATH selects a specific Chromium.
// Headless sandbox numbers are indicative, not a substitute for a real device.
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";
import { chromium } from "@playwright/test";

const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const server = spawn(process.execPath, ["scripts/serve.mjs", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

const pct = (arr, p) => [...arr].sort((a, b) => a - b)[Math.floor((p / 100) * arr.length)] ?? 0;

try {
  // Chunk size: scripts requested only after scrolling to #products.
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    const lazy = [];
    page.on("response", (res) => res.request().resourceType() === "script" && lazy.push(res));
    await page.locator("#products").scrollIntoViewIfNeeded();
    await page.waitForSelector('#products[data-motion="products-motion"]');
    let raw = 0;
    let gz = 0;
    for (const res of lazy) {
      const body = await res.body();
      raw += body.length;
      gz += gzipSync(body, { level: 9 }).length;
    }
    console.log(
      "Lazy products motion chunk(s):",
      JSON.stringify({
        files: lazy.map((r) => r.url().replace(BASE, "")),
        rawKB: +(raw / 1024).toFixed(1),
        gzipKB: +(gz / 1024).toFixed(1),
      }),
    );
    await page.close();
  }

  for (const r of [
    { label: "1440×900 @2x, no throttle", width: 1440, height: 900, throttle: 1 },
    { label: "1440×900 @2x, 4× CPU", width: 1440, height: 900, throttle: 4 },
    { label: "390×844 @2x, 4× CPU", width: 390, height: 844, throttle: 4 },
  ]) {
    const ctx = await browser.newContext({
      viewport: { width: r.width, height: r.height },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await page.locator(".product-card").first().scrollIntoViewIfNeeded();
    await page.waitForSelector('#products[data-motion="products-motion"]');
    await page.waitForTimeout(1500);
    if (r.width > 768) await page.locator('[data-product="clusters"]').hover(); // 1.5× on one card
    if (r.throttle > 1) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: r.throttle });
    }
    const frames = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const out = [];
          const t0 = performance.now();
          const f = (t) => {
            out.push(t);
            if (t - t0 < 8000) requestAnimationFrame(f);
            else resolve(out);
          };
          requestAnimationFrame(f);
        }),
    );
    const iv = frames.slice(1).map((f, i) => f - frames[i]);
    const running = await page.$$eval(".product-card", (cs) => cs.map((c) => c.dataset.running));
    console.log(
      JSON.stringify({
        label: r.label,
        cardsRunning: running,
        fps: +((frames.length - 1) / ((frames.at(-1) - frames[0]) / 1000)).toFixed(1),
        p95FrameMs: +pct(iv, 95).toFixed(1),
        over20msPct: +((iv.filter((v) => v > 20).length / iv.length) * 100).toFixed(1),
      }),
    );
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
