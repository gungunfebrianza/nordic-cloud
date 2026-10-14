import { expect, test, type Page } from "@playwright/test";
import { CERTIFICATIONS } from "../src/content/certifications";
import { DEMO_SECURITY_LOG, DEMO_UPTIME_90D } from "../src/content/demo";
import {
  CONFIRM,
  SECURITY_BLOCKS,
  SECURITY_HEADING,
  STATUS_URL,
  isPlaceholder,
} from "../src/content/security";
import { DURATION, HEARTBEAT_MS } from "../src/lib/motion-constants";
import { PACKETS, PACKET_HOP_S } from "../src/components/security/shield-geometry";

const section = (page: Page) => page.locator("#security");
const stage = (page: Page) => page.locator("#security .sec-stage");
const LOOP_MS = HEARTBEAT_MS * 4;

async function showSecurity(page: Page) {
  await page.goto("/");
  await section(page).scrollIntoViewIfNeeded();
  await expect(stage(page)).toHaveAttribute("data-running", "true");
}

test.describe("#security", () => {
  test("heading, four blocks, and a visible chip for every {{CONFIRM}}", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#security-heading")).toHaveText(SECURITY_HEADING);
    await expect(section(page).locator(".sec-block")).toHaveCount(4);
    const marked = SECURITY_BLOCKS.reduce((n, b) => n + b.body.split(CONFIRM).length - 1, 0);
    expect(marked).toBeGreaterThan(0);
    const chips = section(page).locator('[data-placeholder="CONFIRM"]');
    await expect(chips).toHaveCount(marked);
    await expect(chips.first()).toBeVisible();
    await expect(chips.first()).toHaveText("{{CONFIRM}}");
  });

  test("certifications render only real entries: nothing while the file is empty", async ({
    page,
  }) => {
    expect(CERTIFICATIONS).toEqual([]);
    await page.goto("/");
    await expect(section(page).locator("[data-certifications]")).toHaveCount(0);
    await expect(section(page).locator("img")).toHaveCount(0);
    await expect(section(page)).not.toContainText(/certif|\bISO\b|\bSOC ?2\b|\bGDPR\b/i);
  });

  test("status card is demo-labelled and not a link while STATUS_URL is a placeholder", async ({
    page,
  }) => {
    expect(isPlaceholder(STATUS_URL)).toBe(true);
    await page.goto("/");
    const card = section(page).locator(".sec-status");
    await expect(card).toHaveCount(1);
    expect(await card.evaluate((el) => el.tagName)).toBe("DIV");
    await expect(section(page).locator('a[href*="{{"]')).toHaveCount(0);
    await expect(card).toContainText("All systems operational");
    await expect(card).toContainText(/demo/i);
    await expect(card.locator("rect[data-day]")).toHaveCount(DEMO_UPTIME_90D.value.length);
    await expect(card.locator('svg[role="img"]')).toHaveAttribute("aria-label", /^Demo data\./);
  });

  test("the shield and its log carry a demo tag and a text alternative", async ({ page }) => {
    await page.goto("/");
    await expect(stage(page)).toContainText(/demo/i);
    await expect(stage(page).locator('svg[role="img"]')).toHaveAttribute("aria-label", /sentinel/);
    // Screen readers get each event once; the moving copy is hidden.
    await expect(stage(page).locator(".sr-only li")).toHaveCount(DEMO_SECURITY_LOG.value.length);
    await expect(stage(page).locator(".sec-log-window")).toHaveAttribute("aria-hidden", "true");
  });

  test("loops are off until the section is on screen, and stop when it leaves", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(stage(page)).not.toHaveAttribute("data-running", "true");
    expect(
      await page.evaluate(
        () => document.querySelector("#security")!.getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
    await section(page).scrollIntoViewIfNeeded();
    await expect(stage(page)).toHaveAttribute("data-running", "true");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(stage(page)).toHaveAttribute("data-running", "false");
  });

  test("each log line lands with its catch, one per heartbeat, on a 4-beat loop", async ({
    page,
  }) => {
    await showSecurity(page);
    const timing = await page.evaluate(() => {
      const anims = document.querySelector("#security")!.getAnimations({ subtree: true });
      const pick = (sel: string) =>
        anims
          .filter((a) => ((a as CSSAnimation).effect as KeyframeEffect).target?.matches(sel))
          .map((a) => {
            const effect = a.effect as KeyframeEffect;
            const t = effect.getTiming();
            return {
              name: (a as CSSAnimation).animationName,
              delay: Number(t.delay),
              duration: Number(t.duration),
              offsets: effect
                .getKeyframes()
                .map((k) => Math.round((k.computedOffset ?? 0) * 10000)),
            };
          });
      return { packets: pick(".sec-packet"), hits: pick(".sec-hit"), log: pick(".sec-log-strip") };
    });
    const catchAt = Math.round((PACKET_HOP_S * 1000 * 10000) / LOOP_MS); // 12.5% of the loop
    expect(timing.packets).toHaveLength(PACKETS.length);
    timing.packets.forEach((p, k) => {
      expect(p.duration).toBeCloseTo(LOOP_MS, 3);
      expect(p.delay).toBeCloseTo(k * HEARTBEAT_MS, 3);
      expect(p.offsets).toContain(catchAt);
    });
    timing.hits.forEach((h) => expect(h.offsets).toContain(catchAt));
    expect(timing.log).toHaveLength(1);
    const [log] = timing.log;
    expect(log?.duration).toBeCloseTo(LOOP_MS, 3);
    // The log steps at the catch point of each of the four heartbeats.
    for (let k = 0; k < 4; k++) {
      expect(log?.offsets).toContain(catchAt + k * 2500);
    }
  });

  test("packets hop within the brief's 0.8–1.6 s and log lines match their sentinels", async ({
    page,
  }) => {
    expect(PACKET_HOP_S * 1000).toBeGreaterThanOrEqual(DURATION.packetHopMin * 1000);
    expect(PACKET_HOP_S * 1000).toBeLessThanOrEqual(DURATION.packetHopMax * 1000);
    await page.goto("/");
    const lines = await stage(page).locator(".sr-only li").allTextContents();
    PACKETS.forEach((p, k) => {
      expect(lines[k]).toContain(`sentinel-${String(p.sentinel + 1).padStart(2, "0")}`);
    });
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows a still frame: one caught grey packet, no loops", async ({ page }) => {
      await page.goto("/");
      await section(page).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(stage(page)).not.toHaveAttribute("data-running", "true");
      expect(
        await page.evaluate(
          () => document.querySelector("#security")!.getAnimations({ subtree: true }).length,
        ),
      ).toBe(0);
      const visible = await stage(page)
        .locator(".sec-packet")
        .evaluateAll((els) =>
          els
            .filter((e) => Number(getComputedStyle(e).opacity) > 0)
            .map((e) => e.getAttribute("data-packet")),
        );
      expect(visible).toEqual([String(PACKETS.length - 1)]);
    });
  });

  test("no layout shift from the section", async ({ page }) => {
    await page.goto("/");
    const cls = await page.evaluate(async () => {
      let total = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number })[])
          total += e.value;
      }).observe({ type: "layout-shift", buffered: true });
      document.querySelector("#security")!.scrollIntoView();
      await new Promise((r) => setTimeout(r, 3000));
      return total;
    });
    expect(cls).toBeLessThan(0.05);
  });
});
