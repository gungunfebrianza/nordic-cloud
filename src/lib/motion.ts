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
import { DURATION, EASE, HEARTBEAT_S, SPRING, STAGGER, heartbeatPhase } from "./motion-constants";

export {
  DURATION,
  EASE,
  HEARTBEAT_MS,
  HEARTBEAT_S,
  SPRING,
  STAGGER,
  heartbeatPhase,
  heartbeats,
  packetHopDuration,
} from "./motion-constants";

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
