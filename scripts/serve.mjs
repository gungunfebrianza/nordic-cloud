// Minimal static server for the export in out/, used by Playwright and Lighthouse.
// Usage: node scripts/serve.mjs [port]
// Gzips text responses like any production CDN would, so Lighthouse sees realistic transfer sizes.
// Supports single byte ranges (206 / 416), so videos can seek.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { createGzip } from "node:zlib";

const ROOT = path.resolve("out");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt",
};

async function resolve(urlPath) {
  const clean = path
    .normalize(decodeURIComponent(urlPath.split("?")[0]))
    .replace(/^(\.\.[/\\])+/, "");
  let file = path.join(ROOT, clean);
  if (!file.startsWith(ROOT)) return null;
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const file = await resolve(req.url ?? "/");
  if (!file) {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
    createReadStream(path.join(ROOT, "404.html"))
      .on("error", () => res.end())
      .pipe(res);
    return;
  }
  const immutable = file.includes(`${path.sep}_next${path.sep}static${path.sep}`);
  const type = TYPES[path.extname(file)] ?? "application/octet-stream";
  const headers = {
    "content-type": type,
    "cache-control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
    vary: "accept-encoding",
    "accept-ranges": "bytes",
  };

  // Byte ranges (video seeking), served uncompressed like any CDN. Single ranges only;
  // anything else falls through to a normal 200.
  const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range ?? "").trim());
  if (range && (range[1] || range[2])) {
    const size = (await stat(file)).size;
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end || start >= size) {
      res.writeHead(416, { ...headers, "content-range": `bytes */${size}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      ...headers,
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-length": end - start + 1,
    });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }

  const compress =
    /^(text\/|application\/json|image\/svg)/.test(type) &&
    /\bgzip\b/.test(String(req.headers["accept-encoding"] ?? ""));
  res.writeHead(200, { ...headers, ...(compress ? { "content-encoding": "gzip" } : {}) });
  const stream = createReadStream(file);
  (compress ? stream.pipe(createGzip()) : stream).pipe(res);
}).listen(PORT, () => console.log(`Serving out/ on http://localhost:${PORT}`));
