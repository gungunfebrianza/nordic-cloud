// Generates src/components/how/europe-data.ts: a low-detail outline of Europe for the #how panel.
// Source: Natural Earth 1:50m (public domain) via the world-atlas npm package (TopoJSON).
// Usage: npm pack world-atlas@2.0.2 && tar xzf world-atlas-2.0.2.tgz
//        node scripts/gen-europe.mjs package/land-50m.json package/countries-50m.json
// The package is not a dependency: the output is committed, so this runs only when the map changes.
import { readFileSync, writeFileSync } from "node:fs";

const [landPath, countriesPath] = process.argv.slice(2);
if (!landPath || !countriesPath)
  throw new Error("usage: gen-europe.mjs <land-50m.json> <countries-50m.json>");

// Frame (degrees) and output size (SVG user units). Equirectangular, x scaled by cos(54°).
const LON = [-14, 56];
const LAT = [34, 71.5];
const H = 400;
const K = Math.cos((54 * Math.PI) / 180);
const W = Math.round((H * (LON[1] - LON[0]) * K) / (LAT[1] - LAT[0]));
const project = ([lon, lat]) => [
  ((lon - LON[0]) * K * H) / (LAT[1] - LAT[0]),
  ((LAT[1] - lat) * H) / (LAT[1] - LAT[0]),
];
const TOLERANCE = 1.4; // simplification, in user units
const MIN_AREA = 14; // drop rings smaller than this, in square user units

function decodeArcs(topo) {
  const { scale, translate } = topo.transform;
  return topo.arcs.map((arc) => {
    let x = 0,
      y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
}

function ringFromArcs(arcs, idx) {
  const out = [];
  for (const i of idx) {
    const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
    out.push(...(out.length ? a.slice(1) : a));
  }
  // Unwrap longitudes so rings that cross the antimeridian (Eurasia) stay continuous.
  for (let k = 1; k < out.length; k++) {
    const d = out[k][0] - out[k - 1][0];
    if (Math.abs(d) > 180) out[k] = [out[k][0] - Math.sign(d) * 360, out[k][1]];
  }
  const minLon = Math.min(...out.map((p) => p[0]));
  const shift = minLon < -180 ? 360 * Math.ceil((-180 - minLon) / 360) : 0;
  return shift ? out.map(([x, y]) => [x + shift, y]) : out;
}

function polygons(topo, geom) {
  const arcs = decodeArcs(topo);
  const polys =
    geom.type === "Polygon" ? [geom.arcs] : geom.type === "MultiPolygon" ? geom.arcs : [];
  return polys.flatMap((poly) => poly.map((ring) => ringFromArcs(arcs, ring)));
}

// Sutherland–Hodgman clip against the frame, in projected space.
function clip(ring) {
  const edges = [(p) => p[0] >= 0, (p) => p[0] <= W, (p) => p[1] >= 0, (p) => p[1] <= H];
  const cut = [
    (a, b) => lerp(a, b, (0 - a[0]) / (b[0] - a[0])),
    (a, b) => lerp(a, b, (W - a[0]) / (b[0] - a[0])),
    (a, b) => lerp(a, b, (0 - a[1]) / (b[1] - a[1])),
    (a, b) => lerp(a, b, (H - a[1]) / (b[1] - a[1])),
  ];
  let pts = ring;
  edges.forEach((inside, e) => {
    const next = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i],
        prev = pts[(i + pts.length - 1) % pts.length];
      if (inside(cur)) {
        if (!inside(prev)) next.push(cut[e](prev, cur));
        next.push(cur);
      } else if (inside(prev)) next.push(cut[e](prev, cur));
    }
    pts = next;
  });
  return pts;
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Douglas–Peucker. A closed ring is split at its farthest point from the start first.
function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const [fx, fy] = pts[0];
  const [lx, ly] = pts[pts.length - 1];
  if (Math.hypot(lx - fx, ly - fy) < 1e-6) {
    let m = 1;
    pts.forEach(([x, y], i) => {
      if (Math.hypot(x - fx, y - fy) > Math.hypot(pts[m][0] - fx, pts[m][1] - fy)) m = i;
    });
    return [...dp(pts.slice(0, m + 1), tol).slice(0, -1), ...dp(pts.slice(m), tol)];
  }
  return dp(pts, tol);
}

function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let max = 0,
      idx = -1;
    const [ax, ay] = pts[s],
      [bx, by] = pts[e];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    for (let i = s + 1; i < e; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > tol) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const area = (pts) =>
  Math.abs(
    pts.reduce((s, p, i) => {
      const q = pts[(i + 1) % pts.length];
      return s + p[0] * q[1] - q[0] * p[1];
    }, 0),
  ) / 2;

function toPath(rings, tol = TOLERANCE) {
  return rings
    .map((r) => clip(r.map(project)))
    .map((r) => simplify(r, tol))
    .filter((r) => r.length >= 3 && area(r) >= MIN_AREA)
    .map((r) => "M" + r.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join("L") + "Z")
    .join("");
}

const land = JSON.parse(readFileSync(landPath, "utf8"));
const countries = JSON.parse(readFileSync(countriesPath, "utf8"));
const landPathD = toPath(land.objects.land.geometries.flatMap((g) => polygons(land, g)));
const dk = countries.objects.countries.geometries.find((g) => g.properties?.name === "Denmark");
const dkPathD = toPath(polygons(countries, dk), 0.4);
const [cphX, cphY] = project([12.57, 55.68]).map((v) => Math.round(v));

writeFileSync(
  new URL("../src/components/how/europe-data.ts", import.meta.url),
  `// Generated by scripts/gen-europe.mjs from Natural Earth 1:50m (public domain). Do not edit.
export const EUROPE = {
  width: ${W},
  height: ${H},
  land: "${landPathD}",
  denmark: "${dkPathD}",
  copenhagen: { x: ${cphX}, y: ${cphY} },
} as const;
`,
);
console.log({ W, H, landBytes: landPathD.length, dkBytes: dkPathD.length, cph: [cphX, cphY] });
