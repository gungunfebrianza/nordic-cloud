/**
 * Geometry for the #security "shield of nodes": a ring of sentinels around a vault, and the four
 * alert packets the ring catches per loop. Pure numbers, shared by the SVG and the tests.
 */
import { DEMO_SECURITY_LOG } from "@/content/demo";

export const VIEW = 420;
export const C = VIEW / 2;
export const RING_R = 140;
export const SENTINELS = 8;
export const SENTINEL_R = 9;
export const VAULT = 96;
export const PACKET_R = 4;

/** Seconds. Each packet's hop lasts PACKET_HOP_S; the loop is 4 heartbeats, one catch per beat. */
export const PACKET_HOP_S = 1.2;
export const LOOP_BEATS = 4;

const rad = (deg: number) => (deg * Math.PI) / 180;
const round = (n: number) => Math.round(n * 10) / 10;

export type Point = { x: number; y: number };

/** Sentinel i, clockwise from the top. */
export function sentinelAt(i: number): Point {
  const a = rad(-90 + (360 / SENTINELS) * i);
  return { x: round(C + RING_R * Math.cos(a)), y: round(C + RING_R * Math.sin(a)) };
}

export const sentinelName = (i: number) => `sentinel-${String(i + 1).padStart(2, "0")}`;

export type Packet = { k: number; sentinel: number; from: Point; to: Point };

/**
 * Packet k is caught by DEMO_SECURITY_LOG[k].sentinel. It starts outside the ring, slightly off
 * the sentinel's radial line, and stops just short of the sentinel.
 */
export const PACKETS: readonly Packet[] = DEMO_SECURITY_LOG.value.map(({ sentinel }, k) => {
  const base = -90 + (360 / SENTINELS) * sentinel;
  const a = rad(base + (k % 2 === 0 ? 14 : -14));
  const from = { x: C + 205 * Math.cos(a), y: C + 205 * Math.sin(a) };
  const s = sentinelAt(sentinel);
  const dx = from.x - s.x;
  const dy = from.y - s.y;
  const len = Math.hypot(dx, dy);
  const stop = SENTINEL_R + PACKET_R + 1;
  return {
    k,
    sentinel,
    from: { x: round(from.x), y: round(from.y) },
    to: { x: round(s.x + (dx / len) * stop), y: round(s.y + (dy / len) * stop) },
  };
});

/** Hop length in px, for the 0.8–1.6 s packet rule. */
export const hopLength = (p: Packet) => Math.hypot(p.to.x - p.from.x, p.to.y - p.from.y);
