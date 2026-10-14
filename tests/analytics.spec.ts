import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { parseAnalytics } from "../src/lib/analytics";

test.describe("analytics config", () => {
  test("off by default", () => {
    expect(parseAnalytics({})).toBeNull();
    expect(parseAnalytics({ NEXT_PUBLIC_ANALYTICS: "off" })).toBeNull();
    expect(parseAnalytics({ NEXT_PUBLIC_ANALYTICS: "" })).toBeNull();
  });

  test("plausible and umami from the site's own domain", () => {
    expect(
      parseAnalytics({
        NEXT_PUBLIC_ANALYTICS: "plausible",
        NEXT_PUBLIC_ANALYTICS_SRC: "/js/script.js",
        NEXT_PUBLIC_ANALYTICS_SITE: "serperku.example",
      }),
    ).toEqual({
      provider: "plausible",
      src: "/js/script.js",
      attrs: { "data-domain": "serperku.example" },
    });
    expect(
      parseAnalytics({
        NEXT_PUBLIC_ANALYTICS: "umami",
        NEXT_PUBLIC_ANALYTICS_SRC: "/umami/script.js",
        NEXT_PUBLIC_ANALYTICS_SITE: "0b1c-website-id",
      }),
    ).toEqual({
      provider: "umami",
      src: "/umami/script.js",
      attrs: { "data-website-id": "0b1c-website-id" },
    });
  });

  test("refuses third-party sources and misconfiguration", () => {
    const on =
      (src: string, site = "x") =>
      () =>
        parseAnalytics({
          NEXT_PUBLIC_ANALYTICS: "plausible",
          NEXT_PUBLIC_ANALYTICS_SRC: src,
          NEXT_PUBLIC_ANALYTICS_SITE: site,
        });
    expect(on("https://plausible.io/js/script.js")).toThrow(/own domain/);
    expect(on("//cdn.example/script.js")).toThrow(/own domain/);
    expect(on("")).toThrow(/own domain/);
    expect(on("/js/script.js", "")).toThrow(/required/);
    expect(() => parseAnalytics({ NEXT_PUBLIC_ANALYTICS: "ga4" })).toThrow(
      /off, plausible or umami/,
    );
  });
});

for (const p of ["/", "/da/"]) {
  test(`analytics off (this build): no script on ${p}, nothing in the export`, async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (r) => r.resourceType() === "script" && scripts.push(r.url()));
    await page.goto(p);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await expect(page.locator("script[data-analytics]")).toHaveCount(0);
    expect(scripts.filter((u) => /script\.js|umami|plausible/.test(u))).toEqual([]);
    // No cookie is set by anything on the page.
    expect(await page.context().cookies()).toEqual([]);
  });
}

test("while off, the exported pages render no analytics script or config", () => {
  for (const file of ["index.html", path.join("da", "index.html")]) {
    const html = readFileSync(path.resolve("out", file), "utf8");
    expect(html).not.toMatch(/data-domain=|data-website-id=|data-analytics=/);
    // The RSC payload carries no Analytics props either.
    expect(html).not.toContain('"provider":"plausible"');
    expect(html).not.toContain('"provider":"umami"');
  }
});
