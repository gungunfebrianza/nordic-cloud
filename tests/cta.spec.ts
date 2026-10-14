import { expect, test, type Page } from "@playwright/test";
import { da } from "../src/content/da";
import { en } from "../src/content/en";

const section = (page: Page) => page.locator("#cta");
const form = (page: Page) => page.locator("#cta form");
const input = (page: Page) => form(page).locator('input[type="email"]');
const button = (page: Page) => form(page).locator('button[type="submit"]');

/** Points the form at a same-origin mock endpoint (the real one is baked at build). */
async function useEndpoint(page: Page, url: string) {
  await form(page).evaluate((el, u) => (el.dataset.endpoint = u), url);
}

test.describe("#cta", () => {
  test("the page's only full-bleed aurora; headline and form on a frosted white panel", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(section(page).locator("h2")).toHaveText(en.cta.heading);
    const fullBleed = await page.evaluate(
      () =>
        [...document.querySelectorAll("body *")].filter((el) => {
          const cs = getComputedStyle(el);
          return (
            cs.backgroundImage.includes("linear-gradient") &&
            el.getBoundingClientRect().width >= document.documentElement.clientWidth - 1
          );
        }).length,
    );
    expect(fullBleed).toBe(1);
    expect(await section(page).evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
      "linear-gradient",
    );
    await expect(section(page).locator(".cta-panel h2")).toHaveCSS("color", "rgb(10, 16, 32)");
    const panelBg = await section(page)
      .locator(".cta-panel")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(panelBg).toBe("rgba(255, 255, 255, 0.9)");
  });

  test("privacy line: note, Privacy as text + chip while its URL is a placeholder, {{CONFIRM}}", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(form(page)).toContainText(en.cta.privacyNote);
    await expect(form(page).locator('[data-placeholder="PRIVACY_URL"]')).toBeVisible();
    await expect(form(page).locator('[data-placeholder="CONFIRM"]')).toBeVisible();
    await expect(form(page).locator('a[href*="{{"]')).toHaveCount(0);
  });

  for (const [path, t] of [
    ["/", en],
    ["/da/", da],
  ] as const) {
    test(`${path}: invalid email shows an inline error and sends nothing`, async ({ page }) => {
      const posts: string[] = [];
      page.on("request", (r) => r.method() === "POST" && posts.push(r.url()));
      await page.goto(path);
      await useEndpoint(page, "/__signup");
      await input(page).fill("not-an-email");
      await button(page).click();
      await expect(form(page).locator(".cta-error")).toHaveText(t.cta.invalid);
      await expect(input(page)).toHaveAttribute("aria-invalid", "true");
      await expect(input(page)).toBeFocused();
      expect(posts).toEqual([]);
    });

    test(`${path}: the endpoint gets the email and locale`, async ({ page }) => {
      let body: unknown = null;
      await page.route("**/__signup", async (route) => {
        body = route.request().postDataJSON();
        await new Promise((r) => setTimeout(r, 400));
        await route.fulfill({ status: 200, body: "{}" });
      });
      await page.goto(path);
      await useEndpoint(page, "/__signup");
      await input(page).fill("ops@example.eu");
      await button(page).click();
      // Disabled while sending.
      await expect(button(page)).toBeDisabled();
      await expect(button(page)).toHaveText(t.cta.sending);
      await expect(form(page)).toHaveAttribute("data-state", "done");
      expect(body).toEqual({ email: "ops@example.eu", locale: path === "/" ? "en" : "da" });
      await expect(form(page).getByRole("status")).toHaveText(t.cta.success);
    });

    test(`${path}: a failed request shows the error`, async ({ page }) => {
      await page.route("**/__signup", (route) => route.fulfill({ status: 500, body: "" }));
      await page.goto(path);
      await useEndpoint(page, "/__signup");
      await input(page).fill("ops@example.eu");
      await button(page).click();
      await expect(form(page).locator(".cta-error")).toHaveText(t.cta.failed);
      await expect(button(page)).toBeEnabled();
    });
  }

  test("no endpoint (this build): no request, the check still plays and stays", async ({
    page,
  }) => {
    const posts: string[] = [];
    page.on("request", (r) => r.method() === "POST" && posts.push(r.url()));
    await page.goto("/");
    await expect(form(page)).toHaveAttribute("data-endpoint", "");
    await input(page).fill("ops@example.eu");
    const before = (await button(page).boundingBox())!;
    await button(page).click();
    await expect(form(page)).toHaveAttribute("data-state", "done");
    await expect(button(page)).toBeDisabled();
    // The button morphs into a circle with a check.
    await expect
      .poll(async () => {
        const b = (await button(page).boundingBox())!;
        return Math.round(b.width - b.height);
      })
      .toBe(0);
    expect(before.width).toBeGreaterThan(before.height + 20);
    await expect(button(page).locator(".cta-check")).toHaveCSS("opacity", "1");
    expect(
      await button(page)
        .locator(".cta-ring")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("heartbeat");
    expect(await button(page).evaluate((el) => getComputedStyle(el).transitionDuration)).toContain(
      "0.25s",
    );
    await page.waitForTimeout(500);
    await expect(form(page)).toHaveAttribute("data-state", "done");
    expect(posts).toEqual([]);
  });
});
