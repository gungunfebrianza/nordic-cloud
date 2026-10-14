// Writes public/.well-known/security.txt (RFC 9116) from the constants in src/content/legal.ts.
// Runs before every build (npm "prebuild"). Expires is one year after the build, so the file is
// generated, not committed (.gitignore). check:brand warns while it still holds a placeholder.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SECURITY_EMAIL } from "../src/content/legal.ts";

const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4173").replace(/\/$/, "");
const expires = new Date();
expires.setUTCFullYear(expires.getUTCFullYear() + 1);

const body = [
  `Contact: mailto:${SECURITY_EMAIL}`,
  `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, ".000Z")}`,
  "Preferred-Languages: en, da",
  `Canonical: ${site}/.well-known/security.txt`,
  "",
].join("\n");

const dir = path.resolve("public", ".well-known");
await mkdir(dir, { recursive: true });
await writeFile(path.join(dir, "security.txt"), body, "utf8");
console.log(`✓ public/.well-known/security.txt (expires ${expires.toISOString().slice(0, 10)})`);
if (/\{\{[A-Z_]+\}\}/.test(body))
  console.warn("! security.txt still holds a placeholder (SECURITY_EMAIL in src/content/legal.ts)");
