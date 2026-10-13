import { GRAPH, NODE_RADIUS } from "./graph";

const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

/**
 * Static first-paint snapshot of the hero network, rendered on the server as inline SVG.
 * No viewBox: positions are percentages and radii are pixels, exactly like the canvas, so the
 * two line up during the cross-fade at any size.
 *
 * The first core node carries one slow pulse (CSS). It is the only motion that survives
 * prefers-reduced-motion.
 */
export function NetworkSnapshot() {
  const { nodes, links } = GRAPH;
  const core = nodes[0]!;
  return (
    <svg className="hero-snapshot absolute inset-0 size-full" aria-hidden="true" focusable="false">
      <g stroke="var(--color-line)" strokeWidth="1" shapeRendering="geometricPrecision">
        {links.map((l) => {
          const a = nodes[l.a]!;
          const b = nodes[l.b]!;
          return <line key={l.id} x1={pct(a.x)} y1={pct(a.y)} x2={pct(b.x)} y2={pct(b.y)} />;
        })}
      </g>
      <circle
        className="hero-core-pulse"
        cx={pct(core.x)}
        cy={pct(core.y)}
        r={NODE_RADIUS.core}
        fill="none"
        stroke="var(--color-signal)"
        strokeWidth="1"
        data-rm-ok=""
      />
      {nodes.map((n) =>
        n.tier === "core" ? (
          <circle
            key={n.id}
            cx={pct(n.x)}
            cy={pct(n.y)}
            r={NODE_RADIUS.core}
            fill="var(--color-signal)"
          />
        ) : n.tier === "agent" ? (
          <circle
            key={n.id}
            cx={pct(n.x)}
            cy={pct(n.y)}
            r={NODE_RADIUS.agent}
            fill="var(--color-surface)"
            stroke="var(--color-signal)"
            strokeWidth="1.25"
          />
        ) : (
          <circle
            key={n.id}
            cx={pct(n.x)}
            cy={pct(n.y)}
            r={NODE_RADIUS.task}
            fill="var(--color-pulse)"
          />
        ),
      )}
    </svg>
  );
}
