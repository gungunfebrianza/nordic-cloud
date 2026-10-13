import { CLUSTER, VIEW, agentPos, hexPoints } from "./geometry";

/** Multi-agent clusters: five agents around an orchestrator; shared memory appears on hover. */
export function ClusterRing() {
  const { cx, cy, agents, hexR } = CLUSTER;
  const pts = Array.from({ length: agents }, (_, i) => agentPos(i));
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="size-full"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="var(--color-line)">
        {pts.map((p, i) => {
          const q = pts[(i + 1) % agents]!;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={p.x} y2={p.y} />
              <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
            </g>
          );
        })}
      </g>
      {/* Shared memory: fades in on hover/focus (CSS), linked to every agent. */}
      <g className="cluster-memory">
        {pts.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="var(--color-aurora)"
            strokeOpacity={0.55}
          />
        ))}
        <polygon
          points={hexPoints(hexR)}
          fill="var(--color-aurora)"
          fillOpacity={0.1}
          stroke="var(--color-aurora)"
        />
      </g>
      {pts.map((_, i) => (
        <circle
          key={i}
          data-anim="packet"
          data-i={i}
          cx={cx}
          cy={cy}
          r={2.25}
          fill="var(--color-pulse)"
          opacity={0}
        />
      ))}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={6}
          fill="var(--color-surface)"
          stroke="var(--color-signal)"
          strokeWidth={1.25}
        />
      ))}
      <circle cx={cx} cy={cy} r={8} fill="var(--color-signal)" />
    </svg>
  );
}
