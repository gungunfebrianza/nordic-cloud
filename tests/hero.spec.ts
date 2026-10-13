import { expect, test, type Page } from "@playwright/test";
import { DEMO } from "../src/content/demo";
import { COUNTS } from "../src/components/hero/graph";

const stage = (page: Page) => page.locator(".hero-stage");

test.describe("hero", () => {
  test("first paint is a static SVG snapshot of the full graph, in the HTML", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();
    const svg = html.match(/<svg class="hero-snapshot[\s\S]*?<\/svg>/)?.[0] ?? "";
    expect(svg).not.toBe("");
    const nodes = COUNTS.core + COUNTS.agent + COUNTS.task;
    // +1 for the core pulse ring.
    expect(svg.match(/<circle/g)?.length).toBe(nodes + 1);
    expect(nodes).toBeGreaterThanOrEqual(30);
    expect(nodes).toBeLessThanOrEqual(45);
    // The canvas module is not referenced by the initial HTML.
    expect(html).not.toContain("hero-canvas-2d");
  });

  test("LCP is hero copy painted at first paint, never the network", async ({ page }) => {
    await page.goto("/");
    const lcp = await page.evaluate(
      () =>
        new Promise<{ inCopy: boolean; inStage: boolean; time: number; fcp: number }>((resolve) => {
          new PerformanceObserver((list) => {
            const e = list.getEntries().at(-1) as PerformanceEntry & { element?: Element };
            const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
            resolve({
              inCopy: !!e.element?.closest("#hero") && !e.element?.closest(".hero-stage"),
              inStage: !!e.element?.closest(".hero-stage"),
              time: e.startTime,
              fcp,
            });
          }).observe({ type: "largest-contentful-paint", buffered: true });
        }),
    );
    expect(lcp.inStage).toBe(false);
    expect(lcp.inCopy).toBe(true);
    expect(lcp.time).toBeLessThanOrEqual(lcp.fcp + 50); // painted with the first frame
  });

  test("copy, CTAs and trust row", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("#hero");
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
      "Agents that never clock out.",
    );
    await expect(hero.getByText("Built in Copenhagen.")).toBeVisible();
    await expect(hero.getByRole("link", { name: "Deploy your first agent" })).toBeVisible();
    for (const t of ["Hosted in the EU", "GDPR by design", "Monitored 24/7"]) {
      await expect(hero.getByText(t)).toBeVisible();
    }
    await expect(hero.getByText("demo", { exact: true })).toBeVisible();
  });

  test('"See how it works" scrolls to #how', async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "See how it works" }).click();
    await expect(page).toHaveURL(/#how$/);
    await expect(page.locator("#how")).toBeInViewport();
  });

  test("the canvas loads lazily and cross-fades in over the snapshot", async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (r) => r.resourceType() === "script" && scripts.push(r.url()));
    await page.goto("/");
    await page.waitForLoadState("load");
    const before = scripts.length;
    await stage(page).scrollIntoViewIfNeeded();
    await expect(stage(page)).toHaveAttribute("data-state", "live", { timeout: 10_000 });
    expect(scripts.length).toBeGreaterThan(before); // the canvas chunk arrived after load
    await expect(page.locator(".hero-canvas")).toHaveAttribute("data-renderer", "hero-canvas-2d");
    await expect
      .poll(() => page.locator(".hero-canvas").evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");
    await expect
      .poll(() => page.locator(".hero-snapshot").evaluate((el) => getComputedStyle(el).opacity))
      .toBe("0");
  });

  test("caps devicePixelRatio at 2", async ({ browser }) => {
    const ctx = await browser.newContext({
      deviceScaleFactor: 3,
      viewport: { width: 1440, height: 900 },
    });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-state", "live", { timeout: 10_000 });
    const ratio = await page
      .locator(".hero-canvas")
      .evaluate((c: HTMLCanvasElement) => c.width / c.getBoundingClientRect().width);
    expect(ratio).toBeCloseTo(2, 1);
    await ctx.close();
  });

  test("pauses when off-screen or the tab is hidden", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator(".hero-canvas");
    await stage(page).scrollIntoViewIfNeeded();
    await expect(stage(page)).toHaveAttribute("data-state", "live", { timeout: 10_000 });
    await expect(canvas).toHaveAttribute("data-running", "true");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(canvas).toHaveAttribute("data-running", "false");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(canvas).toHaveAttribute("data-running", "true");

    const setHidden = (hidden: boolean) =>
      page.evaluate((h) => {
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          get: () => (h ? "hidden" : "visible"),
        });
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);
    await setHidden(true);
    await expect(canvas).toHaveAttribute("data-running", "false");
    await setHidden(false);
    await expect(canvas).toHaveAttribute("data-running", "true");
  });

  test("hovering a node shows its tooltip", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to pointer devices");
    await page.goto("/");
    await expect(stage(page)).toHaveAttribute("data-state", "live", { timeout: 10_000 });
    // Agent nodes are the snapshot circles with a white fill; same positions as the canvas.
    const agent = page.locator('.hero-snapshot circle[fill="var(--color-surface)"]').first();
    const box = (await agent.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const tooltip = page.locator(".hero-tooltip");
    await expect(tooltip).toHaveAttribute("data-visible", "true");
    await expect(tooltip).toHaveText(/^agent-\d{2} · .+ · up \d+ d$/);
    await page.mouse.move(5, 5);
    await expect(tooltip).toHaveAttribute("data-visible", "false");
  });

  test("agents-online count drifts within its DEMO range", async ({ browser }) => {
    // Reduced motion keeps the canvas and motion loops off, so the fake clock only drives timers.
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.clock.install();
    await page.goto("/");
    const el = page.getByTestId("agents-online");
    const read = async () => Number((await el.textContent())!.replace(/,/g, ""));
    const start = DEMO.agentsOnline.value;
    expect(await read()).toBe(start);
    const seen = new Set<number>();
    for (let i = 0; i < 8; i++) {
      await page.clock.runFor(5_000);
      const v = await read();
      seen.add(v);
      expect(Math.abs(v - start)).toBeLessThanOrEqual(
        start * DEMO.agentsOnlineDrift.value.maxDeviation,
      );
    }
    expect(seen.size).toBeGreaterThan(1);
    await ctx.close();
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("keeps the static SVG; only the core node pulses", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("load");
      await page.waitForTimeout(2_000);
      await expect(stage(page)).toHaveAttribute("data-state", "static");
      await expect(page.locator(".hero-canvas")).not.toHaveAttribute("data-renderer", /.*/);
      const running = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => (a.effect?.getTiming().iterations ?? 1) === Infinity)
          .map((a) => (a.effect as KeyframeEffect).target?.getAttribute("class") ?? ""),
      );
      expect(running).toEqual(["hero-core-pulse"]);
    });
  });
});

test.describe("hero screenshots", () => {
  for (const width of [390, 1440]) {
    test(`hero at ${width}px`, async ({ browser }, info) => {
      test.skip(info.project.name !== "desktop", "one run per width is enough");
      const ctx = await browser.newContext({
        viewport: { width, height: width < 768 ? 844 : 900 },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `tests/__screenshots__/hero-${width}-first-paint.png` });
      await stage(page).scrollIntoViewIfNeeded();
      await expect(stage(page)).toHaveAttribute("data-state", "live", { timeout: 10_000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(4_000); // let a task travel part of its route
      await page.screenshot({
        path: `tests/__screenshots__/hero-${width}-live.png`,
        fullPage: false,
      });
      await page
        .locator("#hero")
        .screenshot({ path: `tests/__screenshots__/hero-${width}-section.png` });
      await ctx.close();
    });
  }
});

test("precomputed graph matches buildGraph()", async () => {
  const { buildGraph, GRAPH } = await import("../src/components/hero/graph");
  expect(GRAPH).toEqual(buildGraph());
});
