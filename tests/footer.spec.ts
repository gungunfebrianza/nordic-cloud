import { expect, test } from "@playwright/test";
import { da } from "../src/content/da";
import { en } from "../src/content/en";
import { SECURITY_EMAIL } from "../src/content/legal";
import { BRAND } from "../src/content/site";

for (const [path, t] of [
  ["/", en],
  ["/da/", da],
] as const) {
  test.describe(`footer ${path}`, () => {
    test("company details are plainly visible", async ({ page }) => {
      await page.goto(path);
      const company = page.locator("footer address");
      await expect(company).toBeVisible();
      await expect(company).toContainText(BRAND);
      for (const name of ["ADDRESS", "CVR", "EMAIL"])
        await expect(company.locator(`[data-placeholder="${name}"]`)).toBeVisible();
      await expect(company).toContainText(`${t.footer.cvr} {{CVR}}`);
      // Email becomes mailto: only once real.
      await expect(company.locator('a[href^="mailto:"]')).toHaveCount(0);
    });

    test("legal links: placeholders are text with a chip, never anchors; Security links to #security", async ({
      page,
    }) => {
      await page.goto(path);
      const legal = page.locator(`footer ul[aria-label="${t.footer.legal}"]`);
      for (const [label, name] of [
        [t.footer.links.privacy, "PRIVACY_URL"],
        [t.footer.links.cookies, "COOKIES_URL"],
        [t.footer.links.terms, "TERMS_URL"],
        [t.footer.links.dpa, "DPA_URL"],
        [t.footer.links.status, "STATUS_URL"],
      ] as const) {
        const item = legal.locator("li", { hasText: label });
        await expect(item.locator(`[data-placeholder="${name}"]`)).toBeVisible();
        await expect(item.locator("a")).toHaveCount(0);
      }
      await expect(legal.getByRole("link", { name: t.footer.links.security })).toHaveAttribute(
        "href",
        "#security",
      );
      await expect(page.locator('a[href*="{{"]')).toHaveCount(0);
      await expect(page.locator("footer ul.lang-switch a")).toHaveCount(2);
    });
  });
}

test("security.txt is served (RFC 9116 fields, expires in about a year)", async ({ request }) => {
  const res = await request.get("/.well-known/security.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/^text\/plain/);
  const body = await res.text();
  expect(body).toContain(`Contact: mailto:${SECURITY_EMAIL}`);
  expect(body).toContain("Preferred-Languages: en, da");
  expect(body).toMatch(/^Canonical: https?:\/\/.+\/\.well-known\/security\.txt$/m);
  const expires = new Date(body.match(/^Expires: (.+)$/m)![1]!);
  const days = (expires.getTime() - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(330);
  expect(days).toBeLessThan(367);
});
