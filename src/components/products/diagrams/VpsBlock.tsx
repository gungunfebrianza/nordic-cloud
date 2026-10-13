import { VIEW, VPS, laneY, sparkPath } from "./geometry";

/** Agent VPS: a server block with four live lanes inside an isolation boundary. Static snapshot. */
export function VpsBlock() {
  const { block, boundary, lanes, spark } = VPS;
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="size-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="vps-spark-clip">
          <rect x={0} y={-2} width={spark.w} height={spark.h + 4} />
        </clipPath>
      </defs>
      <rect
        className="vps-boundary"
        x={boundary.x}
        y={boundary.y}
        width={boundary.w}
        height={boundary.h}
        rx={boundary.r}
        fill="none"
        strokeDasharray="4 5"
      />
      <rect
        x={block.x}
        y={block.y}
        width={block.w}
        height={block.h}
        rx={block.r}
        fill="var(--color-surface)"
        stroke="var(--color-line)"
      />
      {lanes.map((label, i) => {
        const y = laneY(i);
        return (
          <g key={label}>
            <text
              x={block.x + 16}
              y={y + spark.h / 2 + 3.5}
              fontFamily="var(--font-mono)"
              fontSize={10}
              letterSpacing="0.06em"
              fill="var(--color-ink-muted)"
            >
              {label}
            </text>
            <line
              x1={spark.x}
              x2={spark.x + spark.w}
              y1={y + spark.h}
              y2={y + spark.h}
              stroke="var(--color-line)"
            />
            <g transform={`translate(${spark.x} ${y})`} clipPath="url(#vps-spark-clip)">
              <path
                data-anim="spark"
                data-lane={i}
                d={sparkPath(17 + i * 31)}
                fill="none"
                stroke={label === "NET" ? "var(--color-pulse)" : "var(--color-signal)"}
                strokeWidth={1.25}
                strokeLinejoin="round"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
