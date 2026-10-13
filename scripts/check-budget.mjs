// Fails if the gzipped initial JS for "/" exceeds the budget in CLAUDE.md.
// Reads the static export in out/ (run `npm run build` first).
// Excluded: chunks whose file name contains "hero-canvas" (the lazy hero canvas is outside the budget)
// and noModule polyfill scripts (modern browsers never download them).
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const BUDGET_KB = 150;
const EXCLUDE = /hero-canvas/;
const OUT = path.resolve("out");

const html = await readFile(path.join(OUT, "index.html"), "utf8");
const tags = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
const srcs = [
  ...new Set(
    tags
      .filter((tag) => !/\bnoModule\b/i.test(tag))
      .map((tag) => tag.match(/src="([^"]+\.js)"/)?.[1])
      .filter(Boolean),
  ),
];

let total = 0;
const rows = [];
for (const src of srcs) {
  if (EXCLUDE.test(src)) continue;
  const buf = await readFile(path.join(OUT, src.replace(/^\//, "")));
  const gz = gzipSync(buf, { level: 9 }).length;
  total += gz;
  rows.push([src, gz]);
}

rows.sort((a, b) => b[1] - a[1]);
for (const [src, gz] of rows) console.log(`${(gz / 1024).toFixed(1).padStart(7)} KB  ${src}`);
const kb = total / 1024;
console.log(`${kb.toFixed(1).padStart(7)} KB  total initial JS (gzip), budget ${BUDGET_KB} KB`);

if (kb > BUDGET_KB) {
  console.error(`✗ Over budget by ${(kb - BUDGET_KB).toFixed(1)} KB`);
  process.exit(1);
}
console.log("✓ Within budget");
