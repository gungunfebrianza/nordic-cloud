import { expect, test, type Page } from "@playwright/test";
import { da } from "../src/content/da";
import { en } from "../src/content/en";
import { FAQ_IDS } from "../src/content/faq";

const section = (page: Page) => page.locator("#faq");
const q = (page: Page, id: string) => page.locator(`#faq-q-${id}`);
const a = (page: Page, id: string) => page.locator(`#faq-a-${id}`);

test.describe("#faq", () => {
  for (const [path, t] of [
    ["/", en],
    ["/da/", da],
  ] as const) {
    test(`${path}: eight questions in that language, all closed`, async ({ page }) => {
      await page.goto(path);
      await expect(section(page).locator(".faq-q")).toHaveCount(8);
      for (const id of FAQ_IDS) {
        await expect(q(page, id)).toHaveText(t.faq.items[id].q);
        await expect(q(page, id)).toHaveAttribute("aria-expanded", "false");
        await expect(q(page, id)).toHaveAttribute("aria-controls", `faq-a-${id}`);
        await expect(a(page, id).locator("p")).toBeHidden();
      }
    });
  }

  test("a question opens and closes its answer (height + fade, chevron turns)", async ({
    page,
  }) => {
    await page.goto("/");
    const height = () => a(page, "sla").evaluate((el) => el.getBoundingClientRect().height);
    expect(await height()).toBe(0);
    expect(await a(page, "sla").evaluate((el) => getComputedStyle(el).transitionDuration)).toBe(
      "0.3s, 0.3s",
    );
    const chev = q(page, "sla").locator(".faq-chev");
    expect(await chev.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.2s");

    await q(page, "sla").click();
    await expect(q(page, "sla")).toHaveAttribute("aria-expanded", "true");
    await expect(a(page, "sla").locator("p")).toBeVisible();
    await expect.poll(height).toBeGreaterThan(20);
    await expect.poll(() => chev.evaluate((el) => getComputedStyle(el).rotate)).toBe("180deg");
    await expect(a(page, "sla").locator('[data-placeholder="SLA_PERCENT"]')).toBeVisible();
    await expect(a(page, "sla").locator('[data-placeholder="CONFIRM"]').first()).toBeVisible();

    await q(page, "sla").click();
    await expect(q(page, "sla")).toHaveAttribute("aria-expanded", "false");
    await expect.poll(height).toBe(0);
    await expect(a(page, "sla").locator("p")).toBeHidden();
  });

  test("several can be open; keyboard works", async ({ page }) => {
    await page.goto("/");
    await q(page, "gpu").focus();
    await page.keyboard.press("Enter");
    await q(page, "keys").focus();
    await page.keyboard.press("Space");
    await expect(q(page, "gpu")).toHaveAttribute("aria-expanded", "true");
    await expect(q(page, "keys")).toHaveAttribute("aria-expanded", "true");
    await expect(a(page, "gpu").locator("p")).toBeVisible();
    await expect(a(page, "keys").locator("p")).toBeVisible();
  });

  test("access answer links to #security; no FAQ structured data", async ({ page }) => {
    await page.goto("/");
    await q(page, "access").click();
    await expect(a(page, "access").getByRole("link", { name: /More on security/ })).toHaveAttribute(
      "href",
      "#security",
    );
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.join("")).not.toContain("FAQPage");
  });
});

test.describe("#faq without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("every answer shows", async ({ page }) => {
    await page.goto("/");
    for (const id of FAQ_IDS) await expect(a(page, id).locator("p")).toBeVisible();
  });
});
