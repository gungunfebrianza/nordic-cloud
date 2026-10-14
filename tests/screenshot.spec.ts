import { test } from "@playwright/test";

// Saves review screenshots (not pixel-diffed yet; the page is still a scaffold).
test("screenshots", async ({ page }, info) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `tests/__screenshots__/${info.project.name}-top.png` });
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/__screenshots__/${info.project.name}-scrolled.png` });
  await page.screenshot({
    path: `tests/__screenshots__/${info.project.name}-full.png`,
    fullPage: true,
  });
});

// Full-page review images of both languages at desktop and phone widths.
for (const [path, lang] of [
  ["/", "en"],
  ["/da/", "da"],
] as const) {
  for (const width of [1440, 390]) {
    test(`full page ${lang} at ${width}px`, async ({ browser }, info) => {
      test.skip(info.project.name !== "desktop", "one run per width is enough");
      test.setTimeout(90_000);
      const ctx = await browser.newContext({
        viewport: { width, height: width < 768 ? 844 : 900 },
      });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      // Walk down once so lazy sections settle before the full-page capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `tests/__screenshots__/page-${lang}-${width}.png`,
        fullPage: true,
      });
      await ctx.close();
    });
  }
}
