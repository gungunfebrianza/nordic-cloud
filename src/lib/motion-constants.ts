/**
 * Motion constants with no runtime dependencies. Safe to import anywhere, including the lazy
 * hero canvas, without pulling in the motion library. Values mirror the motion tokens in
 * src/styles/tokens.css; keep both in sync.
 */

export const HEARTBEAT_MS = 2400;
export const HEARTBEAT_S = HEARTBEAT_MS / 1000;

/** Cubic-bezier tuples for motion; CSS equivalents live in tokens.css. */
export const EASE = {
  entrance: [0.22, 1, 0.36, 1],
  linear: [0, 0, 1, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** Seconds, because motion takes seconds. */
export const DURATION = {
  microMin: 0.15,
  micro: 0.2,
  microMax: 0.25,
  entranceMin: 0.6,
  entrance: 0.75,
  entranceMax: 0.9,
  packetHopMin: 0.8,
  packetHopMax: 1.6,
} as const;

export const STAGGER = {
  min: 0.06,
  default: 0.07,
  max: 0.08,
} as const;

/** Spring for UI micro-interactions. */
export const SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

/** Duration of an ambient loop: always a whole number of heartbeats. */
export function heartbeats(count: number): number {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Ambient loops must be a whole number of heartbeats, got ${count}`);
  }
  return count * HEARTBEAT_S;
}

/**
 * Per-element phase offset so "always on" scenes shimmer rather than blink in unison.
 * Deterministic (golden-ratio spread) so server and client render identically.
 * Returns a negative delay in seconds: the element starts mid-cycle instead of waiting.
 */
export function heartbeatPhase(index: number): number {
  const phase = (index * 0.618_033_988_75) % 1;
  return -phase * HEARTBEAT_S;
}

/** Clamp a packet hop duration into the brief's 0.8–1.6 s window based on link length. */
export function packetHopDuration(lengthPx: number, pxPerSecond = 180): number {
  const s = lengthPx / pxPerSecond;
  return Math.min(DURATION.packetHopMax, Math.max(DURATION.packetHopMin, s));
}
