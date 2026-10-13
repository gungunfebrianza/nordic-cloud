import { DIAL, VIEW, tickPoints } from "./geometry";

/** Always-on bots: an agent with a heartbeat inside a 24-hour dial. Static snapshot. */
export function BotsDial() {
  const { cx, cy, r, taskHours, restAt } = DIAL;
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="size-full"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-line)" />
      {Array.from({ length: 24 }, (_, h) => {
        const major = h % 6 === 0;
        return (
          <line
            key={h}
            {...tickPoints(h, r - (major ? 10 : 6), r - 2)}
            stroke="var(--color-ink-muted)"
            strokeOpacity={major ? 0.55 : 0.3}
            strokeWidth={1}
            strokeLinecap="round"
          />
        );
      })}
      {taskHours.map((h) => (
        <line
          key={h}
          data-anim="tick"
          data-at={h / 24}
          {...tickPoints(h, r - 12, r - 2)}
          stroke="var(--color-live)"
          strokeWidth={2.25}
          strokeLinecap="round"
          opacity={h / 24 < restAt ? 1 : 0}
        />
      ))}
      {/* Hand. The transparent circle centres the group's box on the dial, so it rotates about the centre. */}
      <g
        data-anim="hand"
        style={{
          rotate: `${restAt * 360}deg`,
          transformBox: "fill-box",
          transformOrigin: "50% 50%",
        }}
      >
        <circle cx={cx} cy={cy} r={r - 14} fill="none" />
        <line
          x1={cx}
          y1={cy - 14}
          x2={cx}
          y2={cy - r + 14}
          stroke="var(--color-ink)"
          strokeWidth={1.25}
          strokeLinecap="round"
        />
      </g>
      <circle
        data-anim="ring"
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        cx={cx}
        cy={cy}
        r={7}
        fill="none"
        stroke="var(--color-signal)"
        opacity={0}
      />
      <circle cx={cx} cy={cy} r={7} fill="var(--color-signal)" />
    </svg>
  );
}
