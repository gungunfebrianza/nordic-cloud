import { expect, test, type Page } from "@playwright/test";
import { AGENT_YAML, DATACENTER_LOCATIONS, HOW_HEADING, HOW_STEPS } from "../src/content/how";

const section = (page: Page) => page.locator("#how");
const panel = (page: Page) => page.locator(".how-panel");

/** Scroll so the middle of step n sits at the middle of the viewport. */
async function scrollToStep(page: Page, n: number) {
  await page.evaluate((n) => {
    const r = document.querySelector(`.how-step[data-n="${n}"]`)!.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + r.top + r.height / 2 - innerHeight / 2,
      behavior: "instant",
    });
  }, n);
}

async function controllerReady(page: Page) {
  await section(page).scrollIntoViewIfNeeded();
  await expect(section(page)).toHaveAttribute("data-scroll", "how-scroll", { timeout: 10_000 });
}

test.describe("how", () => {
  test("steps, all four panel states and the film frame are in the HTML; the controller is not", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain(HOW_HEADING);
    for (const s of HOW_STEPS) expect(html).toContain(s.title);
    const panelHtml =
      html.match(/<div class="how-panel how-stage"[\s\S]*?class="how-rail"/)?.[0] ?? "";
    for (const layer of ["how-scene", "how-code", "how-dash"]) expect(panelHtml).toContain(layer);
    expect(panelHtml).toContain('data-step="1"');
    expect(html).toContain("require_approval");
    expect(html).toContain(DATACENTER_LOCATIONS);
    expect(html).not.toContain('data-scroll="how-scroll"');
  });

  test.describe("desktop", () => {
    test.skip(({ isMobile }) => isMobile, "the sticky panel is desktop only");

    test("the panel follows the steps both ways, without touching native scroll", async ({
      page,
    }) => {
      await page.goto("/");
      await controllerReady(page);
      for (const n of [1, 2, 3, 4, 3, 2, 1]) {
        await scrollToStep(page, n);
        await expect(panel(page)).toHaveAttribute("data-step", String(n));
        await expect(page.locator(`.how-step[data-n="${n}"]`)).toHaveAttribute(
          "aria-current",
          "step",
        );
      }
      // The panel is sticky: it stays in view while the steps scroll past.
      const top = () => panel(page).evaluate((el) => Math.round(el.getBoundingClientRect().top));
      await scrollToStep(page, 2);
      const a = await top();
      await scrollToStep(page, 3);
      expect(await top()).toBe(a);
      // Native scrolling: the wheel moves the page by what it asks for.
      const y0 = await page.evaluate(() => window.scrollY);
      await page.mouse.move(700, 450);
      await page.mouse.wheel(0, 300);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y0 + 250);
    });

    test("the config types itself out when step 1 is first seen", async ({ page }) => {
      await page.goto("/");
      // Load the controller while the panel is still below the fold.
      await page.evaluate(() => {
        const r = document.getElementById("how")!.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + r.top - innerHeight - 100);
      });
      await expect(section(page)).toHaveAttribute("data-scroll", "how-scroll", { timeout: 10_000 });
      await expect(panel(page)).toHaveAttribute("data-typing", "armed");
      await scrollToStep(page, 1);
      await expect(panel(page)).toHaveAttribute("data-typing", "true");
      const code = panel(page).locator(".how-code-pre code");
      const partial = (await code.textContent())!.length;
      expect(partial).toBeLessThan(AGENT_YAML.replace(/\n/g, "").length);
      await expect(panel(page)).not.toHaveAttribute("data-typing", /.*/, { timeout: 8_000 });
      await expect(code).toHaveText(AGENT_YAML.replace(/\n/g, ""));
    });

    test("step 4 streams a log line per heartbeat; loops pause off-screen", async ({ page }) => {
      await page.goto("/");
      await controllerReady(page);
      await scrollToStep(page, 4);
      await expect(panel(page)).toHaveAttribute("data-running", "true");
      const first = () => panel(page).locator(".how-log li").first().textContent();
      const before = await first();
      await expect.poll(first, { timeout: 6_000 }).not.toBe(before);
      await expect(panel(page).locator(".how-log li")).toHaveCount(9);
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(panel(page)).toHaveAttribute("data-running", "false");
    });

    test.describe("reduced motion", () => {
      test.use({ reducedMotion: "reduce" });
      test("states still follow the scroll; nothing types or loops", async ({ page }) => {
        await page.goto("/");
        await controllerReady(page);
        await expect(panel(page)).not.toHaveAttribute("data-typing", /.*/);
        await expect(panel(page).locator(".how-code-pre code")).toHaveText(
          AGENT_YAML.replace(/\n/g, ""),
        );
        await scrollToStep(page, 3);
        await expect(panel(page)).toHaveAttribute("data-step", "3");
        const loops = await page.evaluate(
          () =>
            document
              .getAnimations()
              .filter(
                (a) =>
                  a.playState === "running" && (a.effect?.getTiming().iterations ?? 1) === Infinity,
              )
              .filter((a) => (a.effect as KeyframeEffect).target?.closest("#how")).length,
        );
        expect(loops).toBe(0);
      });
    });
  });

  test.describe("mobile", () => {
    test.skip(({ isMobile }) => !isMobile, "mobile layout");

    test("no sticky panel or controller; each step has its own visual", async ({ page }) => {
      await page.goto("/");
      await expect(panel(page)).toBeHidden();
      for (const s of HOW_STEPS) {
        const v = page.locator(`.how-step[data-n="${s.n}"] .how-visual`);
        await v.scrollIntoViewIfNeeded();
        await expect(v).toBeVisible();
        await expect.poll(() => v.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
      }
      await page.waitForTimeout(1_000);
      await expect(section(page)).not.toHaveAttribute("data-scroll", /.*/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        await page.evaluate(() => window.innerWidth),
      );
    });
  });

  test("brand film: never autoplays; poster frame until the files exist", async ({ page }) => {
    await page.goto("/");
    const film = page.locator(".how-film");
    await film.scrollIntoViewIfNeeded();
    const state = await film.getAttribute("data-film");
    if (state === "coming-soon") {
      await expect(film.getByText("Film coming soon")).toBeVisible();
      await expect(film.locator("video")).toHaveCount(0);
      await expect(film.locator("img")).toHaveAttribute("src", /brand-film-poster\.avif$/);
    } else {
      const video = film.locator("video");
      await expect(video).toHaveAttribute("preload", "none");
      await expect(video).not.toHaveAttribute("autoplay", /.*/);
      await expect(video).toHaveAttribute("controls", "");
      await expect(video.locator('track[kind="captions"]')).toHaveCount(1);
      expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    }
  });
});

test.describe("how screenshots", () => {
  test("how at 1440 per step, 390 stacked, film", async ({ browser }, info) => {
    test.skip(info.project.name !== "desktop", "one run is enough");
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto("/");
    await controllerReady(page);
    for (const n of [1, 2, 3, 4]) {
      await scrollToStep(page, n);
      await page.waitForTimeout(n === 1 ? 4_500 : 1_800);
      await page.screenshot({ path: `tests/__screenshots__/how-1440-step${n}.png` });
    }
    await page.locator(".how-film").screenshot({ path: "tests/__screenshots__/how-1440-film.png" });
    await ctx.close();

    const m = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mp = await m.newPage();
    await mp.goto("/");
    for (const s of HOW_STEPS) {
      await mp.locator(`.how-step[data-n="${s.n}"]`).scrollIntoViewIfNeeded();
      await mp.waitForTimeout(900);
    }
    await mp.locator("#how").screenshot({ path: "tests/__screenshots__/how-390.png" });
    await m.close();
  });
});
