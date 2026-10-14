import { expect, test, type Page } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AgentVideo } from "../src/components/media/AgentVideo";
import { USE_CASES, USE_CASES_HEADING } from "../src/content/use-cases";

const TYPE_MS_PER_CHAR = 18;

const section = (page: Page) => page.locator("#use-cases");
const tile = (page: Page, id: string) => page.locator(`.use-case-tile[data-use-case="${id}"]`);
const video = (page: Page, id: string) => tile(page, id).locator("video");

async function motionReady(page: Page) {
  await section(page).scrollIntoViewIfNeeded();
  await expect(section(page)).toHaveAttribute("data-motion", "use-cases-motion", {
    timeout: 10_000,
  });
}

/** Scrolls so `visible` (0–1) of the tile's height is inside the viewport, from the bottom edge. */
async function showFraction(page: Page, id: string, visible: number) {
  await tile(page, id).evaluate((el, f) => {
    const r = el.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + r.top - window.innerHeight + r.height * f,
      behavior: "instant",
    });
  }, visible);
}

test.describe("AgentVideo", () => {
  test("poster only, no video element, when no film file exists", () => {
    const html = renderToStaticMarkup(
      createElement(AgentVideo, { name: "does-not-exist", label: "Nothing" }),
    );
    expect(html).not.toContain("<video");
    expect(html).toContain('src="/media/does-not-exist-poster.avif"');
    expect(html).toContain("aspect-ratio:4 / 5");
  });

  test("renders only the sources that exist, WebM first, and never 404s", async ({ page }) => {
    const missing: string[] = [];
    page.on("response", (r) => r.status() === 404 && missing.push(r.url()));
    await page.goto("/");
    await section(page).scrollIntoViewIfNeeded();
    const v = video(page, "economy");
    await expect(v.locator("source")).toHaveCount(2);
    expect(
      await v.locator("source").evaluateAll((s) => s.map((e) => e.getAttribute("type"))),
    ).toEqual(["video/webm", "video/mp4"]);
    await expect(v).toHaveAttribute("preload", "none");
    expect(await v.evaluate((el: HTMLVideoElement) => [el.muted, el.loop, el.playsInline])).toEqual(
      [true, true, true],
    );
    expect(missing).toEqual([]);
  });

  test("sources attach only near the viewport", async ({ page }) => {
    await page.goto("/");
    await expect(video(page, "blockchain").locator("source")).toHaveCount(0);
  });

  test("plays at 50% visible or more and pauses below", async ({ page, isMobile }) => {
    test.skip(isMobile, "mobile uses the carousel; covered by the one-at-a-time test");
    await page.goto("/");
    await showFraction(page, "banking", 0.7);
    await expect(video(page, "banking")).toHaveAttribute("data-state", "playing", {
      timeout: 10_000,
    });
    await showFraction(page, "banking", 0.3);
    await expect(video(page, "banking")).toHaveAttribute("data-state", "paused");
  });

  test("on mobile only one film plays at a time", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone-only rule");
    await page.goto("/");
    await section(page).locator(".use-case-grid").scrollIntoViewIfNeeded();
    await expect(video(page, "economy")).toHaveAttribute("data-state", "playing", {
      timeout: 10_000,
    });
    const playing = () => section(page).locator('video[data-state="playing"]').count();
    expect(await playing()).toBe(1);
    await section(page)
      .locator(".use-case-grid")
      .evaluate((g) =>
        g.scrollTo({
          left: (g.firstElementChild as HTMLElement).offsetWidth * 1.1,
          behavior: "instant",
        }),
      );
    await expect(video(page, "finance")).toHaveAttribute("data-state", "playing", {
      timeout: 10_000,
    });
    await expect(video(page, "economy")).toHaveAttribute("data-state", "paused");
    expect(await playing()).toBe(1);
  });

  for (const mode of ["reduced motion", "Save-Data"] as const) {
    test(`${mode}: poster with a play button, never autoplays`, async ({ page, isMobile }) => {
      // On phones use the first carousel tile, so snap scrolling never moves the button mid-click.
      const [id, name] = isMobile ? ["economy", "Economy"] : ["security", "Security"];
      if (mode === "reduced motion") await page.emulateMedia({ reducedMotion: "reduce" });
      else
        await page.addInitScript(() =>
          Object.defineProperty(navigator, "connection", { value: { saveData: true } }),
        );
      await page.goto("/");
      await showFraction(page, id, 1);
      const button = tile(page, id).getByRole("button", { name: `Play ${name} film` });
      await expect(button).toBeVisible();
      await page.waitForTimeout(1_500);
      await expect(section(page).locator('video[data-state="playing"]')).toHaveCount(0);
      await button.click();
      await expect(video(page, id)).toHaveAttribute("data-state", "playing", { timeout: 10_000 });
      await tile(page, id)
        .getByRole("button", { name: `Pause ${name} film` })
        .click();
      await expect(video(page, id)).toHaveAttribute("data-state", "paused");
    });
  }

  test("a broken film falls back to the poster silently", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route(/vertical-finance\.(webm|mp4)$/, (route) =>
      route.fulfill({ status: 200, contentType: "video/mp4", body: "not a video" }),
    );
    await page.goto("/");
    await showFraction(page, "finance", 1);
    await expect(tile(page, "finance").locator("video")).toHaveCount(0, { timeout: 10_000 });
    await expect(
      tile(page, "finance").locator('img[src$="vertical-finance-poster.avif"]'),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("use cases", () => {
  test("copy, jobs and demo tags are in the HTML", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain(USE_CASES_HEADING);
    for (const u of USE_CASES) {
      expect(html).toContain(u.outcome.replace("'", "&#x27;"));
      for (const job of u.jobs) expect(html).toContain(job);
    }
    expect(html).toContain("ingest 214 feeds");
    expect(html).toContain("match 41,203 invoices");
    expect(
      html.match(/title="Illustrative figure, not live data"/g)?.length,
    ).toBeGreaterThanOrEqual(2);
    expect(html).not.toContain("use-cases-motion");
  });

  test("desktop bento is exactly 3×3 with Economy spanning 2×2", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout");
    await page.goto("/");
    const boxes = await section(page)
      .locator(".use-case-cell")
      .evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { id: (e as HTMLElement).dataset.cell, x: r.x, y: r.y, w: r.width, h: r.height };
        }),
      );
    const [eco, fin, sec, ban, pro, blo] = boxes;
    const col = fin!.w;
    expect(eco!.w).toBeGreaterThan(col * 2);
    expect(eco!.h).toBeGreaterThan(fin!.h * 2);
    expect(fin!.x).toBeCloseTo(sec!.x, 0);
    expect(sec!.y).toBeGreaterThan(fin!.y);
    for (const b of [ban, pro, blo]) expect(b!.y).toBeCloseTo(ban!.y, 0);
    expect(ban!.y).toBeGreaterThan(sec!.y);
    expect(fin!.h / fin!.w).toBeCloseTo(5 / 4, 1);
  });

  test("mobile carousel snaps and counts", async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone layout");
    await page.goto("/");
    await motionReady(page);
    const grid = section(page).locator(".use-case-grid");
    expect(await grid.evaluate((g) => getComputedStyle(g).scrollSnapType)).toBe("x mandatory");
    const counter = section(page).locator("[data-counter]");
    await expect(counter).toHaveText("1");
    await grid.evaluate((g) => g.scrollBy({ left: 120, behavior: "instant" }));
    // Snapping settles on a tile edge, not where the scroll stopped.
    await expect
      .poll(() =>
        grid.evaluate((g) => {
          const t = g.children[1] as HTMLElement;
          const center = g.scrollLeft + g.clientWidth / 2;
          return Math.abs(t.offsetLeft + t.offsetWidth / 2 - center) < 2;
        }),
      )
      .toBe(true);
    await expect(counter).toHaveText("2");
    await expect(tile(page, "finance").locator(".use-case-link")).toBeVisible();
  });

  test("hover and keyboard focus look the same; one tab stop per tile", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "hover only applies to pointer devices");
    await page.goto("/");
    await motionReady(page);
    const state = (id: string) =>
      tile(page, id).evaluate((el) => ({
        scale: getComputedStyle(el.querySelector(".agent-video > video")!).scale,
        link: getComputedStyle(el.querySelector(".use-case-link")!).opacity,
        scrim: getComputedStyle(el.querySelector(".use-case-scrim")!, "::after").opacity,
      }));
    const rest = await state("programming");
    expect(rest).toEqual({ scale: "none", link: "0", scrim: "0" });
    expect(await tile(page, "programming").locator("a, [tabindex]").count()).toBe(1);

    await tile(page, "programming").hover();
    await expect.poll(() => state("programming")).toEqual({ scale: "1.02", link: "1", scrim: "1" });
    await page.mouse.move(0, 0);
    await expect.poll(() => state("programming")).toEqual(rest);

    await tile(page, "programming")
      .getByRole("link", { name: /Read the playbook/ })
      .focus();
    await expect.poll(() => state("programming")).toEqual({ scale: "1.02", link: "1", scrim: "1" });
    expect(
      await tile(page, "programming").evaluate(
        (el) => getComputedStyle(el.querySelector(".agent-video > video")!).transitionDuration,
      ),
    ).toBe("0.2s");
  });

  test("jobs type in at 18 ms per character and reset on leave", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to pointer devices");
    await page.goto("/");
    await motionReady(page);
    const u = USE_CASES.find((x) => x.id === "blockchain")!;
    const total = u.jobs.join("").length;
    const t = tile(page, "blockchain");
    const typed = () =>
      t.locator("[data-job]").evaluateAll((s) => s.map((e) => e.textContent).join(""));
    expect(await typed()).toBe("");
    // Screen readers always get the full jobs.
    for (const job of u.jobs) await expect(t.locator(".sr-only", { hasText: job })).toHaveCount(1);

    // Timed in the page, from pointerenter until the last character lands.
    const took = t.evaluate(
      (el, n) =>
        new Promise<number>((resolve) => {
          let t0 = 0;
          el.addEventListener("pointerenter", () => (t0 = performance.now()), { once: true });
          const mo = new MutationObserver(() => {
            if (t0 && el.dataset.typed === String(n)) {
              mo.disconnect();
              resolve(performance.now() - t0);
            }
          });
          mo.observe(el, { attributes: true, attributeFilter: ["data-typed"] });
        }),
      total,
    );
    await t.hover();
    const ms = await took;
    expect(await typed()).toBe(u.jobs.join(""));
    expect(ms).toBeGreaterThan(total * TYPE_MS_PER_CHAR * 0.9);
    expect(ms).toBeLessThan(total * TYPE_MS_PER_CHAR + 300);

    await page.mouse.move(0, 0);
    await expect.poll(typed).toBe("");
  });

  test("reduced motion: no scale, jobs appear at once", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to pointer devices");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await motionReady(page);
    const t = tile(page, "banking");
    await t.hover();
    await page.waitForTimeout(100); // typing would show ~5 characters by now
    const u = USE_CASES.find((x) => x.id === "banking")!;
    expect(
      await t.locator("[data-job]").evaluateAll((s) => s.map((e) => e.textContent).join("")),
    ).toBe(u.jobs.join(""));
    expect(
      await t.evaluate((el) => getComputedStyle(el.querySelector(".agent-video > video")!).scale),
    ).toBe("none");
  });

  test("no layout shift and no console errors through the section", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.evaluate(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      // Only shifts inside #use-cases count (the hero chip's mono-font swap is tracked elsewhere).
      type Shift = { value: number; hadRecentInput: boolean; sources: { node?: Node }[] };
      const inSection = (n?: Node) =>
        !!(n instanceof Element ? n : n?.parentElement)?.closest("#use-cases");
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as unknown as Shift[])
          if (!e.hadRecentInput && e.sources.some((s) => inSection(s.node)))
            (window as unknown as { __cls: number }).__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    for (const u of USE_CASES) {
      await tile(page, u.id).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1_000);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBe(0);
    expect(errors).toEqual([]);
  });
});

test.describe("use cases screenshots", () => {
  for (const width of [390, 1440]) {
    test(`use cases at ${width}px`, async ({ browser }, info) => {
      test.skip(info.project.name !== "desktop", "one run per width is enough");
      const ctx = await browser.newContext({
        viewport: { width, height: width < 768 ? 844 : 900 },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      await page.goto("/");
      await motionReady(page);
      await page.waitForTimeout(2_000);
      await section(page).screenshot({ path: `tests/__screenshots__/use-cases-${width}.png` });
      if (width > 768) {
        await tile(page, "finance").hover();
        await page.waitForTimeout(1_500);
        await section(page).screenshot({
          path: `tests/__screenshots__/use-cases-${width}-hover.png`,
        });
      }
      await ctx.close();
    });
  }
});
