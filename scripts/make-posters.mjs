// Generates neutral placeholder posters so the layout never depends on the videos.
// Run: node scripts/make-posters.mjs   (overwrites public/media/*-poster.avif)
// Replace each poster with a real frame from its film when the films arrive.
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const OUT = new URL("../public/media/", import.meta.url);

const posters = [
  { name: "brand-film", label: "brand film", w: 1920, h: 1080 },
  ...["economy", "finance", "security", "banking", "programming", "blockchain"].map((v) => ({
    name: `vertical-${v}`,
    label: v,
    w: 1200,
    h: 1500,
  })),
];

function svg({ label, w, h }) {
  const step = 48;
  const lines = [];
  for (let x = step; x < w; x += step) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`);
  for (let y = step; y < h; y += step) lines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`);
  const cx = w / 2;
  const cy = h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#F6F8FC"/>
  <g stroke="#E3E8F2" stroke-width="1">${lines.join("")}</g>
  <circle cx="${cx}" cy="${cy}" r="56" fill="none" stroke="#E3E8F2" stroke-width="1"/>
  <circle cx="${cx}" cy="${cy}" r="6" fill="#2962FF"/>
  <text x="${cx}" y="${cy + 110}" text-anchor="middle" font-family="monospace" font-size="22"
    letter-spacing="2" fill="#5A6478">${label.toUpperCase()} · PLACEHOLDER</text>
</svg>`;
}

await mkdir(OUT, { recursive: true });
for (const p of posters) {
  const file = new URL(`${p.name}-poster.avif`, OUT);
  await sharp(Buffer.from(svg(p)))
    .avif({ quality: 50, effort: 6 })
    .toFile(file.pathname);
  console.log(`wrote public/media/${p.name}-poster.avif (${p.w}×${p.h})`);
}
