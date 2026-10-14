import type { CSSProperties } from "react";
import { heartbeatPhase } from "@/lib/motion-constants";
import { SHIELD_LABEL } from "@/content/security";
import {
  C,
  PACKETS,
  PACKET_R,
  RING_R,
  SENTINELS,
  SENTINEL_R,
  VAULT,
  VIEW,
  sentinelAt,
} from "./shield-geometry";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Index of the packet whose catch the still frame shows (the newest line of the still log). */
export const STILL_PACKET = PACKETS.length - 1;

/**
 * The "shield of nodes", server-rendered. Every motion is a CSS animation that runs only while
 * the stage has data-running="true" (set near the viewport, never under reduced motion). Without
 * it the SVG is a still frame: the ring, the vault and one alert already caught and greyed out.
 */
export function ShieldScene() {
  const sentinels = Array.from({ length: SENTINELS }, (_, i) => sentinelAt(i));
  const ring = sentinels.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ") + " Z";
  const hits = new Map(PACKETS.map((p) => [p.sentinel, p.k]));
  const v0 = C - VAULT / 2;

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="sec-shield h-auto w-full"
      role="img"
      aria-label={SHIELD_LABEL}
    >
      {/* Spokes: each sentinel guards the vault. */}
      <g className="stroke-line" strokeWidth={1}>
        {sentinels.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={C} y2={C} />
        ))}
      </g>
      {/* The ring itself. */}
      <path d={ring} fill="none" className="stroke-signal" strokeOpacity={0.35} strokeWidth={1} />

      {/* Vault: a ledger, not a padlock cliché. */}
      <rect
        x={v0}
        y={v0}
        width={VAULT}
        height={VAULT}
        rx={20}
        className="fill-surface stroke-ink"
        strokeWidth={1}
      />
      <g className="stroke-ink-muted" strokeWidth={1.5} strokeLinecap="round">
        <line x1={C - 22} y1={C - 12} x2={C + 22} y2={C - 12} />
        <line x1={C - 22} y1={C} x2={C + 14} y2={C} />
        <line x1={C - 22} y1={C + 12} x2={C + 6} y2={C + 12} />
      </g>

      {sentinels.map((p, i) => {
        const k = hits.get(i);
        const label = {
          x: C + ((p.x - C) * (RING_R - 26)) / RING_R,
          y: C + ((p.y - C) * (RING_R - 26)) / RING_R,
        };
        return (
          <g key={i} data-sentinel={i}>
            <g transform={`translate(${p.x} ${p.y})`}>
              {/* Heartbeat: every sentinel is always on, phase-offset so the ring shimmers. */}
              <circle
                r={SENTINEL_R}
                fill="none"
                className="sec-beat stroke-pulse"
                strokeWidth={1}
                style={{ animationDelay: `${heartbeatPhase(i).toFixed(3)}s` }}
              />
              {k !== undefined && (
                <circle
                  r={SENTINEL_R}
                  fill="none"
                  className="sec-hit stroke-signal"
                  strokeWidth={1.5}
                  style={{ "--k": k } as Vars}
                />
              )}
              <circle r={SENTINEL_R} className="fill-signal stroke-surface" strokeWidth={2} />
              <circle r={2.5} className="fill-surface" />
            </g>
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-ink-muted font-mono"
              fontSize={10}
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}

      {/* Alert packets: approach, get caught at the ring, turn grey and dissolve. */}
      {PACKETS.map((p) => (
        <circle
          key={p.k}
          r={PACKET_R}
          className="sec-packet"
          data-packet={p.k}
          data-still={p.k === STILL_PACKET ? "" : undefined}
          style={
            {
              "--k": p.k,
              "--sx": `${p.from.x}px`,
              "--sy": `${p.from.y}px`,
              "--ex": `${p.to.x}px`,
              "--ey": `${p.to.y}px`,
            } as Vars
          }
        />
      ))}
    </svg>
  );
}
