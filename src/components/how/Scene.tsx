import { DATACENTER_LOCATIONS } from "@/content/how";
import { EUROPE } from "./europe-data";
import { MAP, NODE, SCENE, TEAM, teamPos } from "./geometry";

/**
 * Steps 2 and 3, one SVG: the outline of Europe with the deployed agent's container on
 * Copenhagen, then the team that spawns around it. Which layers show is pure CSS, keyed on the
 * nearest .how-stage[data-step] (how.css). `uid` keeps gradient/mask ids unique per instance.
 */
export function Scene({ uid }: { uid: string }) {
  const team = Array.from({ length: TEAM.spawned }, (_, i) => teamPos(i));
  const loopS = TEAM.hopS * 3;
  return (
    <svg
      viewBox={`0 0 ${SCENE.w} ${SCENE.h}`}
      className="how-scene size-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-fade`} cx="48%" cy="44%" r="58%">
          <stop offset="0.4" stopColor="#fff" />
          <stop offset="0.92" stopColor="#000" />
        </radialGradient>
        <mask id={`${uid}-mask`}>
          <rect width={SCENE.w} height={SCENE.h} fill={`url(#${uid}-fade)`} />
        </mask>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="var(--color-signal)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--color-signal)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="how-map" mask={`url(#${uid}-mask)`}>
        <g transform={`translate(${MAP.x} ${MAP.y})`}>
          <path d={EUROPE.land} fill="var(--color-line)" />
          <path className="how-dk" d={EUROPE.denmark} />
        </g>
      </g>
      <circle className="how-glow" cx={NODE.x} cy={NODE.y} r={44} fill={`url(#${uid}-glow)`} />

      {/* Step 3: links draw in, then packets flow orchestrator → agent i → agent i+1 → orchestrator. */}
      <g className="how-team" fill="none" stroke="var(--color-signal)" strokeOpacity="0.35">
        {team.map((p, i) => {
          const q = team[(i + 1) % team.length]!;
          return (
            <g key={i} style={{ "--i": i } as React.CSSProperties}>
              <path className="how-link" d={`M${NODE.x} ${NODE.y}L${p.x} ${p.y}`} pathLength={1} />
              <path className="how-link" d={`M${p.x} ${p.y}L${q.x} ${q.y}`} pathLength={1} />
            </g>
          );
        })}
      </g>
      {team.map((p, i) => {
        const q = team[(i + 1) % team.length]!;
        return (
          <circle
            key={i}
            className="how-loop how-packet"
            cx={NODE.x}
            cy={NODE.y}
            r={2.5}
            fill="var(--color-pulse)"
            style={
              {
                "--ax": `${p.x - NODE.x}px`,
                "--ay": `${p.y - NODE.y}px`,
                "--bx": `${q.x - NODE.x}px`,
                "--by": `${q.y - NODE.y}px`,
                animationDuration: `${loopS}s`,
                animationDelay: `${(-i * loopS) / TEAM.spawned}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
      {team.map((p, i) => (
        <g
          key={i}
          className="how-agent"
          style={
            {
              "--i": i,
              "--dx": `${NODE.x - p.x}px`,
              "--dy": `${NODE.y - p.y}px`,
            } as React.CSSProperties
          }
        >
          <circle
            cx={p.x}
            cy={p.y}
            r={8}
            fill="var(--color-surface)"
            stroke="var(--color-signal)"
            strokeWidth={1.25}
          />
          <circle cx={p.x} cy={p.y} r={2.5} fill="var(--color-signal)" />
        </g>
      ))}

      {/* The deployed agent: a container that lands on Copenhagen and keeps a heartbeat. */}
      <g className="how-ring-g">
        <circle
          className="how-loop how-ring"
          cx={NODE.x}
          cy={NODE.y}
          r={9}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={1}
        />
      </g>
      <g className="how-container">
        <rect
          x={NODE.x - 12}
          y={NODE.y - 9}
          width={24}
          height={18}
          rx={4}
          fill="var(--color-surface)"
          stroke="var(--color-signal)"
          strokeWidth={1.25}
        />
        <path
          d={`M${NODE.x - 6} ${NODE.y - 3}h12M${NODE.x - 6} ${NODE.y + 1}h12M${NODE.x - 6} ${NODE.y + 5}h7`}
          stroke="var(--color-signal)"
          strokeWidth={1}
          strokeLinecap="round"
        />
      </g>
      <g className="how-label">
        <path
          d={`M${NODE.x + 14} ${NODE.y - 8}l14 -18h10`}
          fill="none"
          stroke="var(--color-ink-muted)"
          strokeWidth={0.75}
        />
        <text
          x={NODE.x + 42}
          y={NODE.y - 22}
          className="font-mono"
          fontSize={11}
          fill="var(--color-ink)"
          stroke="var(--color-paper)"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {DATACENTER_LOCATIONS}
        </text>
      </g>
    </svg>
  );
}
