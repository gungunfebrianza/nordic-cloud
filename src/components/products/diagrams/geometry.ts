/**
 * Shared geometry for the #products diagrams. The static SVG (server) and the lazy motion
 * chunk (client) both read from here, so animation starts exactly where the snapshot left off.
 */
import { HEARTBEAT_S } from "@/lib/motion-constants";

export const VIEW = { w: 320, h: 180 } as const;

/* ── Always-on bots: 24-hour dial ─────────────────────────────────────── */
export const DIAL = {
  cx: 160,
  cy: 90,
  r: 70,
  /** One sweep every 9.6 s = 4 heartbeats. */
  sweepS: HEARTBEAT_S * 4,
  /** Hours (0–23) with a scheduled task; their ticks turn live-green as the hand passes. */
  taskHours: [2, 5, 9, 13, 17, 21] as const,
  /** Where the hand rests in the static / reduced-motion snapshot (fraction of a turn). */
  restAt: 0.6,
} as const;

export function tickPoints(hour: number, inner: number, outer: number) {
  const a = (hour / 24) * Math.PI * 2 - Math.PI / 2; // 0h at 12 o'clock
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x1: +(DIAL.cx + cos * inner).toFixed(2),
    y1: +(DIAL.cy + sin * inner).toFixed(2),
    x2: +(DIAL.cx + cos * outer).toFixed(2),
    y2: +(DIAL.cy + sin * outer).toFixed(2),
  };
}

/* ── Agent VPS: server block with four lanes ──────────────────────────── */
export const VPS = {
  block: { x: 64, y: 22, w: 192, h: 136, r: 14 },
  boundary: { x: 46, y: 8, w: 228, h: 164, r: 22 },
  lanes: ["CPU", "GPU", "MEM", "NET"] as const,
  spark: { x: 112, w: 128, h: 18 },
  /** Sparklines scroll one pattern width every 4.8 s = 2 heartbeats; seamless. */
  loopS: HEARTBEAT_S * 2,
} as const;

export function laneY(i: number) {
  return VPS.block.y + 22 + i * 31;
}

/** A periodic sparkline (two copies of one pattern), so translating by one width loops cleanly. */
export function sparkPath(seed: number): string {
  const n = 8;
  const pts: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    pts.push(0.15 + (s / 233280) * 0.7);
  }
  const step = VPS.spark.w / n;
  const coords: string[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const v = pts[i % n]!;
    coords.push(`${(i * step).toFixed(1)},${((1 - v) * VPS.spark.h).toFixed(1)}`);
  }
  return `M${coords.join("L")}`;
}

/* ── Multi-agent clusters: ring around an orchestrator ────────────────── */
export const CLUSTER = {
  cx: 160,
  cy: 90,
  rx: 96,
  ry: 62,
  agents: 5,
  hexR: 22,
  /** Each packet makes three 1.6 s hops (orchestrator → agent → next agent → orchestrator) = 4.8 s. */
  hopS: 1.6,
} as const;

export function agentPos(i: number) {
  const a = (i / CLUSTER.agents) * Math.PI * 2 - Math.PI / 2;
  return {
    x: +(CLUSTER.cx + Math.cos(a) * CLUSTER.rx).toFixed(2),
    y: +(CLUSTER.cy + Math.sin(a) * CLUSTER.ry).toFixed(2),
  };
}

export function hexPoints(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${(CLUSTER.cx + Math.cos(a) * r).toFixed(2)},${(CLUSTER.cy + Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");
}
