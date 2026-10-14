import { expect, test } from "@playwright/test";
import { en } from "../src/content/en";
import { BRAND, SECTION_IDS } from "../src/content/site";

const NAV_ITEMS = en.nav.items;
const SECTIONS = SECTION_IDS.map((id) => ({ id }));

test.describe("page shell", () => {
  test("loads with no console errors and no third-party requests", async ({ page, baseURL }) => {
    const errors: string[] = [];
    const external: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("request", (req) => {
      if (!req.url().startsWith(baseURL!) && !req.url().startsWith("data:"))
        external.push(req.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
    // GDPR: fonts are self-hosted, so nothing (Google Fonts included) leaves our origin.
    expect(external).toEqual([]);
  });

  test("renders the brand name and light theme", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(new RegExp(BRAND));
    const scheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    );
    expect(scheme).toBe("light");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(246, 248, 252)"); // paper
  });

  test("every section anchor exists in order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main > section").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(SECTIONS.map((s) => s.id));
    await expect(page.locator("footer")).toBeVisible();
  });

  test("uses brand fonts", async ({ page }) => {
    await page.goto("/");
    const h1 = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
    const body = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(h1).toMatch(/Space Grotesk/i);
    expect(body).toMatch(/Inter/i);
  });
});

test.describe("nav", () => {
  test("has all links and both actions", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.locator("header");
    for (const item of NAV_ITEMS) {
      await expect(nav.getByRole("link", { name: item.label, exact: true }).first()).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Talk to us" }).first()).toBeVisible();
    await expect(nav.getByRole("link", { name: "Deploy an agent" }).first()).toBeVisible();
  });

  test("gains a hairline border and blur after 24px of scroll", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toHaveAttribute("data-scrolled", "false");

    await page.evaluate(() => window.scrollTo(0, 10));
    await expect(header).toHaveAttribute("data-scrolled", "false");

    await page.evaluate(() => window.scrollTo(0, 200));
    await expect(header).toHaveAttribute("data-scrolled", "true");
    await expect
      .poll(() => header.evaluate((el) => getComputedStyle(el).borderBottomColor))
      .toBe("rgb(227, 232, 242)"); // line
    const blur = await header.evaluate((el) => getComputedStyle(el).backdropFilter);
    expect(blur).toContain("blur");
  });

  test("underline slides in from the left on hover", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to pointer devices");
    await page.goto("/");
    const link = page.locator("header nav").getByRole("link", { name: "Products" });
    const bar = link.locator("span[aria-hidden]");
    expect(await bar.evaluate((el) => getComputedStyle(el).transformOrigin)).toMatch(/^0px/);
    expect(await bar.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.2s");
    await link.hover();
    await expect
      .poll(() => bar.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a))
      .toBeCloseTo(1, 2);
  });

  test("nav links scroll to their sections", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    await page
      .locator("header")
      .getByRole("link", { name: "Pricing", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect(page.locator("#pricing")).toBeInViewport();
  });
});

test.describe("media", () => {
  const posters = [
    "brand-film",
    ...["economy", "finance", "security", "banking", "programming", "blockchain"].map(
      (v) => `vertical-${v}`,
    ),
  ];
  for (const name of posters) {
    test(`placeholder poster exists: ${name}`, async ({ request }) => {
      const res = await request.get(`/media/${name}-poster.avif`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/avif");
    });
  }
});
