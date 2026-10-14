import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// The local server must answer byte ranges, or videos can't seek on localhost.
// Uses a poster as the fixture: posters are always in public/media, films may not be.
const FILE = "vertical-economy-poster.avif";
const bytes = readFileSync(`public/media/${FILE}`);
const url = `/media/${FILE}`;

test.describe("local server byte ranges", () => {
  test.skip(({ isMobile }) => isMobile, "server behaviour; one project is enough");

  test("full file advertises range support", async ({ request }) => {
    const res = await request.get(url);
    expect(res.status()).toBe(200);
    expect(res.headers()["accept-ranges"]).toBe("bytes");
  });

  for (const [header, start, end] of [
    ["bytes=0-99", 0, 99],
    ["bytes=100-", 100, bytes.length - 1],
    ["bytes=-50", bytes.length - 50, bytes.length - 1],
  ] as const) {
    test(`${header} returns 206 with the right bytes`, async ({ request }) => {
      const res = await request.get(url, {
        headers: { range: header, "accept-encoding": "gzip" },
      });
      expect(res.status()).toBe(206);
      expect(res.headers()["content-range"]).toBe(`bytes ${start}-${end}/${bytes.length}`);
      expect(res.headers()["content-encoding"]).toBeUndefined();
      expect(Buffer.compare(await res.body(), bytes.subarray(start, end + 1))).toBe(0);
    });
  }

  test("a range past the end returns 416", async ({ request }) => {
    const res = await request.get(url, { headers: { range: `bytes=${bytes.length}-` } });
    expect(res.status()).toBe(416);
    expect(res.headers()["content-range"]).toBe(`bytes */${bytes.length}`);
  });
});
