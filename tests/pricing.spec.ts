import { expect, test, type Page } from "@playwright/test";
import { displayAmount, formatPrice, parsePrice } from "../src/lib/pricing";

const section = (page: Page) => page.locator("#pricing");
const card = (page: Page, id: string) => page.locator(`.price-card[data-tier="${id}"]`);
/** The price variant CSS is showing in a card. */
const shownPrice = (page: Page, id: string) =>
  card(page, id).locator(".price-v").filter({ visible: true });

/**
 * Prices ship as placeholders, so the count-up never runs on the real page. These fixtures turn
 * the bots card into real numbers before the motion chunk mounts.
 */
const FIXTURE = { monthly: { EUR: 100, DKK: 750 }, annual: { EUR: 1200, DKK: 9000 } } as const;

async function injectFixture(page: Page, intl: string) {
  const values: Record<string, { n: number; text: string }> = {};
  for (const b of ["monthly", "annual"] as const)
    for (const c of ["EUR", "DKK"] as const)
      for (const v of ["excl", "incl"] as const) {
        const n = displayAmount(FIXTURE[b][c], b, v === "incl");
        values[`${b}-${c}-${v}`] = { n, text: formatPrice(n, c, intl) };
      }
  await card(page, "bots").evaluate((el, vals) => {
    for (const s of el.querySelectorAll<HTMLElement>(".price-v")) {
      const val = vals[`${s.dataset.b}-${s.dataset.c}-${s.dataset.v}`]!;
      s.dataset.n = String(val.n);
      s.querySelector(".price-anim")!.textContent = val.text;
      s.querySelector(".sr-only")!.textContent = val.text;
    }
  }, values);
}

async function motionReady(page: Page) {
  await section(page).scrollIntoViewIfNeeded();
  await expect(section(page)).toHaveAttribute("data-motion", "pricing-motion", { timeout: 10_000 });
}

test.describe("price maths", () => {
  test("VAT is exactly ×1.25, annual is the monthly equivalent, rounded once to whole units", () => {
    expect(displayAmount(100, "monthly", false)).toBe(100);
    expect(displayAmount(100, "monthly", true)).toBe(125);
    expect(displayAmount(49, "monthly", true)).toBe(61); // 61.25
    expect(displayAmount(1200, "annual", false)).toBe(100);
    expect(displayAmount(1199, "annual", true)).toBe(125); // 99.92 × 1.25 = 124.9
    expect(displayAmount(750, "monthly", true)).toBe(938); // 937.5
    expect(parsePrice("{{PRICE_BOTS_MONTHLY_EUR}}")).toBeNull();
    expect(parsePrice("49")).toBe(49);
    expect(formatPrice(125, "EUR", "en-GB")).toBe("€125");
    expect(formatPrice(938, "DKK", "da-DK")).toMatch(/^938\s?kr\.$/);
  });
});

test.describe("#pricing", () => {
  test("three tiers in product order; middle one has a signal border, no aurora", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(section(page).locator(".price-card")).toHaveCount(3);
    expect(
      await section(page)
        .locator(".price-card h3")
        .evaluateAll((els) => els.map((e) => e.textContent)),
    ).toEqual(["Always-on bots", "Agent VPS", "Multi-agent clusters"]);
    await expect(card(page, "vps")).toHaveCSS("border-top-color", "rgb(41, 98, 255)");
    await expect(section(page).locator(".bg-aurora")).toHaveCount(0);
    for (const id of ["bots", "vps", "clusters"])
      await expect(card(page, id).getByRole("link", { name: /Deploy an agent/ })).toHaveAttribute(
        "href",
        "#cta",
      );
  });

  test("defaults: monthly, excl. VAT; EUR on /, DKK on /da/", async ({ page }) => {
    for (const [path, currency] of [
      ["/", "eur"],
      ["/da/", "dkk"],
    ] as const) {
      await page.goto(path);
      await expect(page.locator("#pr-billing-monthly")).toBeChecked();
      await expect(page.locator("#pr-vat-excl")).toBeChecked();
      await expect(page.locator(`#pr-currency-${currency}`)).toBeChecked();
    }
  });

  test("toggles are radio groups that work from the keyboard; the pill slides", async ({
    page,
  }) => {
    await page.goto("/");
    const groups = section(page).getByRole("group");
    await expect(groups).toHaveCount(3);
    await expect(section(page).getByRole("radio")).toHaveCount(6);
    const thumb = section(page).locator(".pill-thumb").first();
    expect(await thumb.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.2s");
    const x0 = (await thumb.boundingBox())!.x;

    await page.locator("#pr-billing-monthly").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#pr-billing-annual")).toBeChecked();
    await expect.poll(async () => (await thumb.boundingBox())!.x).toBeGreaterThan(x0 + 20);
    await expect(card(page, "bots").getByText("billed annually")).toBeVisible();
    await expect(card(page, "bots").getByText("billed monthly")).toBeHidden();

    await page.locator("#pr-vat-excl").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#pr-vat-incl")).toBeChecked();
    await expect(card(page, "bots").getByText("incl. 25% Danish VAT")).toBeVisible();
    await expect(card(page, "bots").getByText("excl. VAT", { exact: true })).toBeHidden();
  });

  test("placeholders show as chips and still switch with the toggles", async ({ page }) => {
    await page.goto("/");
    const chip = (name: string) =>
      card(page, "bots").locator(`[data-placeholder="${name}"]`).filter({ visible: true });
    await expect(chip("PRICE_BOTS_MONTHLY_EUR")).toHaveCount(1);
    await page.locator('label[for="pr-currency-dkk"]').click();
    await expect(chip("PRICE_BOTS_MONTHLY_DKK")).toHaveCount(1);
    await expect(chip("PRICE_BOTS_MONTHLY_EUR")).toHaveCount(0);
    await page.locator('label[for="pr-billing-annual"]').click();
    await expect(chip("PRICE_BOTS_ANNUAL_DKK")).toHaveCount(1);
    // Exactly one variant shows per card.
    await expect(shownPrice(page, "bots")).toHaveCount(1);
  });

  test("count-up: old → new in about 300 ms, final value spoken once", async ({ page }) => {
    await page.goto("/");
    await injectFixture(page, "en-GB");
    await motionReady(page);
    const anim = () =>
      shownPrice(page, "bots")
        .locator(".price-anim")
        .evaluate((el) => el.textContent ?? "");
    expect(await anim()).toBe("€100");

    // Sample the digits from inside the page, right after the toggle.
    const samples = page.evaluate(
      () =>
        new Promise<{ t: number; text: string; counting: boolean }[]>((resolve) => {
          const out: { t: number; text: string; counting: boolean }[] = [];
          const t0 = performance.now();
          const tick = () => {
            const el = [
              ...document.querySelectorAll<HTMLElement>('[data-tier="bots"] .price-v'),
            ].find((e) => e.offsetParent !== null);
            const anim = el?.querySelector<HTMLElement>(".price-anim");
            out.push({
              t: performance.now() - t0,
              text: anim?.textContent ?? "",
              counting: anim?.dataset.counting !== undefined,
            });
            if (performance.now() - t0 < 1500) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    await page.locator('label[for="pr-vat-incl"]').click();
    const s = await samples;
    // Intermediate digits appear (the entrance easing front-loads them).
    const between = s.filter((x) => {
      const n = Number(x.text.replace(/\D/g, ""));
      return n > 100 && n < 125;
    });
    expect(between.length).toBeGreaterThan(0);
    // The count runs for about 300 ms and ends exactly on the final value.
    const start = s.find((x) => x.counting)!;
    const end = s.find((x) => x.t > start.t && !x.counting)!;
    expect(end.t - start.t).toBeGreaterThan(250);
    expect(end.t - start.t).toBeLessThan(400);
    expect(end.text).toBe("€125");
    await expect(section(page).locator("[data-pricing-live]")).toContainText(
      "Always-on bots: €125/mo",
    );
  });

  test("count-up is instant under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await injectFixture(page, "en-GB");
    await motionReady(page);
    await page.locator('label[for="pr-vat-incl"]').click();
    // Typing would still be mid-count after 50 ms; reduced motion is already final.
    await page.waitForTimeout(50);
    await expect(shownPrice(page, "bots").locator("[data-counting]")).toHaveCount(0);
    expect(
      await shownPrice(page, "bots")
        .locator(".price-anim")
        .evaluate((el) => el.textContent),
    ).toBe("€125");
  });
});

test.describe("pricing screenshots", () => {
  for (const [path, width] of [
    ["/", 1440],
    ["/", 390],
    ["/da/", 1440],
    ["/da/", 390],
  ] as const) {
    test(`pricing ${path} at ${width}px`, async ({ browser }, info) => {
      test.skip(info.project.name !== "desktop", "one run per width is enough");
      const ctx = await browser.newContext({
        viewport: { width, height: width < 768 ? 844 : 900 },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      await page.goto(path);
      await section(page).scrollIntoViewIfNeeded();
      const lang = path === "/" ? "en" : "da";
      await section(page).screenshot({
        path: `tests/__screenshots__/pricing-${lang}-${width}.png`,
      });
      await ctx.close();
    });
  }
});
