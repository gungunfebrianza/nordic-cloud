import { expect, test, type Page } from "@playwright/test";
import { da } from "../src/content/da";
import { en } from "../src/content/en";

const PAGES = [
  { path: "/", lang: "en", t: en, other: { path: "/da/", lang: "da", label: "DA" } },
  { path: "/da/", lang: "da", t: da, other: { path: "/", lang: "en", label: "EN" } },
] as const;

/** The switch in the header (desktop) or the opened mobile menu. */
async function headerSwitch(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: /menu/i }).click();
  const lists = page.locator("header ul.lang-switch");
  return isMobile ? lists.last() : lists.first();
}

for (const p of PAGES) {
  test.describe(`${p.path}`, () => {
    test("html lang, title and hreflang alternates", async ({ page, baseURL }) => {
      await page.goto(p.path);
      await expect(page.locator("html")).toHaveAttribute("lang", p.lang);
      await expect(page).toHaveTitle(new RegExp(p.t.meta.tagline.replace(".", "\\.")));
      const alt = (l: string) => page.locator(`link[rel="alternate"][hreflang="${l}"]`);
      await expect(alt("en")).toHaveAttribute("href", `${baseURL}/`);
      await expect(alt("da")).toHaveAttribute("href", `${baseURL}/da/`);
      await expect(alt("x-default")).toHaveAttribute("href", `${baseURL}/`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${baseURL}${p.path}`,
      );
    });

    test("renders that language's copy", async ({ page }) => {
      await page.goto(p.path);
      await expect(page.locator("h1")).toHaveText(p.t.hero.headline);
      await expect(page.locator("#products-heading")).toHaveText(p.t.products.heading);
      await expect(page.locator("#how-heading")).toHaveText(p.t.how.heading);
      await expect(page.locator("#use-cases-heading")).toHaveText(p.t.useCases.heading);
      await expect(page.locator("#security-heading")).toHaveText(p.t.security.heading);
      await expect(page.locator("footer")).toContainText(p.t.footer.links.privacy);
    });

    test("language switch: plain links, current marked, goes to the other language", async ({
      page,
      isMobile,
    }) => {
      await page.goto(p.path);
      const sw = await headerSwitch(page, isMobile);
      const current = sw.locator('a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute("hreflang", p.lang);
      const other = sw.getByRole("link", { name: new RegExp(`^${p.other.label}\\b`) });
      await expect(other).toHaveAttribute("href", p.other.path);
      await expect(other).toHaveAttribute("hreflang", p.other.lang);
      await expect(other).not.toHaveAttribute("aria-current", /.*/);
      // The footer has the same switch.
      await expect(page.locator("footer ul.lang-switch a")).toHaveCount(2);

      await other.click();
      await expect(page).toHaveURL(new RegExp(`${p.other.path.replace(/\//g, "\\/")}$`));
      await expect(page.locator("html")).toHaveAttribute("lang", p.other.lang);
      // No cookie or storage remembers the choice.
      expect(await page.context().cookies()).toEqual([]);
      expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
    });

    test("no console errors, no third-party requests, no layout shift", async ({
      page,
      baseURL,
    }) => {
      const errors: string[] = [];
      const external: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (!r.url().startsWith(baseURL!) && !r.url().startsWith("data:")) external.push(r.url());
      });
      await page.goto(p.path);
      await page.evaluate(() => {
        (window as unknown as { __cls: number }).__cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as unknown as {
            value: number;
            hadRecentInput: boolean;
          }[])
            if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
      expect(external).toEqual([]);
      expect(
        await page.evaluate(() => (window as unknown as { __cls: number }).__cls),
      ).toBeLessThan(0.05);
    });
  });
}

test("unknown URLs get the 404 page, in both languages", async ({ page }) => {
  const res = await page.goto("/no-such-page/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: en.notFound.title })).toBeVisible();
  await expect(page.locator('section[lang="da"]')).toContainText(da.notFound.title);
});
