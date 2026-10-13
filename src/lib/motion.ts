"use client";

/**
 * Shared motion language: "the heartbeat".
 * Values mirror the motion tokens in src/styles/tokens.css. Keep both in sync.
 *
 * Rules (from the brief):
 * - Every motion explains something: data flow, uptime, coordination, protection.
 * - Nothing spins for decoration.
 * - Ambient loops are whole multiples of HEARTBEAT_MS and always seamless.
 */

import { useReducedMotion, type Transition, type Variants } from "motion/react";

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
} as const satisfies Transition;

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

export type MotionVariants = {
  /** True when the visitor prefers reduced motion. */
  reduced: boolean;
  /** Fade + rise entrance; opacity-only and instant when reduced. */
  entrance: Variants;
  /** Parent that staggers its children's entrances. */
  stagger: Variants;
  /** Heartbeat ring that expands and fades every HEARTBEAT_MS; static when reduced. */
  heartbeat: (index?: number) => Variants;
  /** Transition for micro-interactions (hover, press, toggles). */
  micro: Transition;
};

/**
 * Reduced-motion-safe variants. Components should use these rather than defining their own,
 * so a visitor's motion preference is respected everywhere.
 */
export function useMotionVariants(): MotionVariants {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    return {
      reduced,
      entrance: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0 } },
      },
      stagger: {
        hidden: {},
        visible: { transition: { staggerChildren: 0 } },
      },
      heartbeat: () => ({
        idle: { scale: 1, opacity: 0 },
        beat: { scale: 1, opacity: 0 },
      }),
      micro: { duration: 0 },
    };
  }

  return {
    reduced,
    entrance: {
      hidden: { opacity: 0, y: 16 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION.entrance, ease: EASE.entrance },
      },
    },
    stagger: {
      hidden: {},
      visible: { transition: { staggerChildren: STAGGER.default } },
    },
    heartbeat: (index = 0) => ({
      idle: { scale: 1, opacity: 0 },
      beat: {
        scale: [1, 2.6],
        opacity: [0.55, 0],
        transition: {
          duration: HEARTBEAT_S,
          ease: "linear",
          repeat: Infinity,
          delay: heartbeatPhase(index),
        },
      },
    }),
    micro: SPRING,
  };
}
