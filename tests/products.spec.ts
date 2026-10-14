import { expect, test, type Page } from "@playwright/test";
import { en } from "../src/content/en";
import { PRICE_BOTS, PRICE_CLUSTERS, PRICE_VPS, PRODUCT_IDS } from "../src/content/products";

const PRODUCTS = PRODUCT_IDS.map((id) => ({ id, ...en.products.items[id] }));

const section = (page: Page) => page.locator("#products");
const card = (page: Page, id: string) => page.locator(`.product-card[data-product="${id}"]`);
const before = (page: Page, id: string, prop: string) =>
  card(page, id).evaluate((el, p) => getComputedStyle(el, "::before").getPropertyValue(p), prop);

async function motionReady(page: Page) {
  await section(page).scrollIntoViewIfNeeded();
  await expect(section(page)).toHaveAttribute("data-motion", "products-motion", {
    timeout: 10_000,
  });
}

test.describe("products", () => {
  test("cards, diagrams and copy are in the HTML; the motion chunk is not", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain("Three ways to run agents that never stop.");
    for (const p of PRODUCTS) expect(html).toContain(`data-product="${p.id}"`);
    expect(html.match(/class="product-diagram"/g)?.length).toBe(3);
    for (const price of [PRICE_BOTS, PRICE_VPS, PRICE_CLUSTERS]) expect(html).toContain(price);
    expect(html).toContain("cron · webhooks · queues");
    expect(html).not.toContain("products-motion");
  });

  test("motion loads near the section and diagrams run; they pause off-screen", async ({
    page,
  }) => {
    await page.goto("/");
    const farAway = await section(page).evaluate(
      (el) => el.getBoundingClientRect().top > window.innerHeight + 400,
    );
    if (farAway) await expect(section(page)).not.toHaveAttribute("data-motion", /.*/);
    await motionReady(page);
    await expect(card(page, "bots")).toHaveAttribute("data-running", "true");
    const hand = () =>
      card(page, "bots")
        .locator('[data-anim="hand"]')
        .evaluate((el) => getComputedStyle(el).rotate);
    const a = await hand();
    await page.waitForTimeout(400);
    expect(await hand()).not.toBe(a);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(card(page, "bots")).toHaveAttribute("data-running", "false");
  });

  test("cards stagger in once when scrolled to", async ({ page }) => {
    await page.goto("/");
    // Bring the section within the 400px preload margin while the cards are still below the fold.
    await page.evaluate(() => {
      const grid = document.querySelector(".product-card")!.parentElement!;
      window.scrollTo(
        0,
        grid.getBoundingClientRect().top + window.scrollY - window.innerHeight - 200,
      );
    });
    await expect(section(page)).toHaveAttribute("data-motion", "products-motion", {
      timeout: 10_000,
    });
    await expect(card(page, "bots")).toHaveAttribute("data-armed", "true");
    await section(page).scrollIntoViewIfNeeded();
    for (const p of PRODUCTS) {
      await expect
        .poll(() => card(page, p.id).evaluate((el) => getComputedStyle(el).opacity))
        .toBe("1");
    }
  });

  test("hover: lift 4px, aurora border, 1.5× diagram, arrow nudge", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to pointer devices");
    await page.goto("/");
    await motionReady(page);
    const c = card(page, "clusters");
    await c.hover();
    await expect.poll(() => c.evaluate((el) => getComputedStyle(el).translate)).toBe("0px -4px");
    await expect.poll(() => before(page, "clusters", "opacity")).toBe("1");
    await expect(c).toHaveAttribute("data-speed", "1.5");
    await expect
      .poll(() => c.locator(".product-arrow").evaluate((el) => getComputedStyle(el).translate))
      .toBe("4px");
    await expect
      .poll(() => c.locator(".cluster-memory").evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");

    await card(page, "vps").hover();
    await expect(c).toHaveAttribute("data-speed", "1");
    await expect
      .poll(() =>
        card(page, "vps")
          .locator(".vps-boundary")
          .evaluate((el) => getComputedStyle(el).stroke),
      )
      .toBe("rgb(41, 98, 255)");
  });

  test("keyboard focus mirrors hover, with one tab stop per card", async ({ page }) => {
    await page.goto("/");
    await motionReady(page);
    const c = card(page, "bots");
    expect(await c.locator("a, button, [tabindex]").count()).toBe(1);
    await c.getByRole("link", { name: /Explore/ }).focus();
    await expect.poll(() => c.evaluate((el) => getComputedStyle(el).translate)).toBe("0px -4px");
    await expect.poll(() => before(page, "bots", "opacity")).toBe("1");
    await expect(c).toHaveAttribute("data-speed", "1.5");
    await page.keyboard.press("Tab"); // to the next card's link
    await expect(c).toHaveAttribute("data-speed", "1");
    await expect(card(page, "vps")).toHaveAttribute("data-speed", "1.5");
  });

  test("Compare plans expands and collapses the table (height + fade, 300 ms)", async ({
    page,
  }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Compare plans" });
    const panel = page.locator(".compare-panel");
    const height = () => panel.evaluate((el) => el.getBoundingClientRect().height);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    expect(await height()).toBe(0);
    expect(await panel.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe(
      "0.3s, 0.3s",
    );

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect.poll(() => panel.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await expect.poll(height).toBeGreaterThan(200);
    expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    await expect(page.getByRole("columnheader", { name: "Agent VPS" })).toBeVisible();

    await button.click();
    await expect.poll(height).toBe(0);
  });

  test.describe("reduced motion", () => {
    test.use({ reducedMotion: "reduce" });
    test("no motion chunk; hover still shows state instantly", async ({ page, isMobile }) => {
      await page.goto("/");
      await section(page).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1_500);
      await expect(section(page)).not.toHaveAttribute("data-motion", /.*/);
      for (const p of PRODUCTS) {
        expect(await card(page, p.id).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
      }
      if (!isMobile) {
        await card(page, "clusters").hover();
        await expect
          .poll(() =>
            card(page, "clusters")
              .locator(".cluster-memory")
              .evaluate((el) => getComputedStyle(el).opacity),
          )
          .toBe("1");
      }
    });
  });
});

test.describe("products screenshots", () => {
  for (const width of [390, 1440]) {
    test(`products at ${width}px`, async ({ browser }, info) => {
      test.skip(info.project.name !== "desktop", "one run per width is enough");
      const ctx = await browser.newContext({
        viewport: { width, height: width < 768 ? 844 : 900 },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      await page.goto("/");
      await motionReady(page);
      await page.waitForTimeout(2_000);
      await section(page).screenshot({ path: `tests/__screenshots__/products-${width}.png` });
      if (width > 768) {
        await card(page, "clusters").hover();
        await page.waitForTimeout(500);
        await section(page).screenshot({
          path: `tests/__screenshots__/products-${width}-hover.png`,
        });
      }
      await page.getByRole("button", { name: "Compare plans" }).click();
      await page.waitForTimeout(500);
      await section(page).screenshot({
        path: `tests/__screenshots__/products-${width}-compare.png`,
      });
      await ctx.close();
    });
  }
});
