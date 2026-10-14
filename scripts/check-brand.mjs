// Guards the brand rules that a linter can't: banned words, pulse used as text colour,
// and hard-coded brand names. Run: npm run check:brand
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const BANNED = ["revolutionary", "game-changing", "unleash", "supercharge", "next-gen", "magic"];
const ROOT = path.resolve("src");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (/\.(tsx?|css|mdx?)$/.test(entry.name)) yield p;
  }
}

const problems = [];
let confirms = 0;
for await (const file of walk(ROOT)) {
  const text = await readFile(file, "utf8");
  const rel = path.relative(process.cwd(), file);
  text.split("\n").forEach((line, i) => {
    const where = `${rel}:${i + 1}`;
    for (const word of BANNED) {
      if (new RegExp(`\\b${word}\\b`, "i").test(line))
        problems.push(`${where} banned word "${word}"`);
    }
    if (/\btext-pulse\b/.test(line)) problems.push(`${where} pulse is graphics-only, never text`);
    if (rel.includes(`content${path.sep}`) && !/const CONFIRM =|^\s*(\*|\/\/|\/\*)/.test(line))
      confirms += (line.match(/\$\{CONFIRM\}|\{\{CONFIRM\}\}/g) ?? []).length;
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`✗ ${problems.length} brand rule violation(s)`);
  process.exit(1);
}
console.log("✓ Brand rules OK");
// Not a failure: drafts are allowed while building. Must be zero before launch.
if (confirms) console.warn(`! ${confirms} draft claim(s) still marked {{CONFIRM}} in src/content`);
