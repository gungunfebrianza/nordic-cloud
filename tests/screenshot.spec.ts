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
