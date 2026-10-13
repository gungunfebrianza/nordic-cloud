import { AGENT_NAME } from "@/content/how";
import { DEMO } from "@/content/demo";
import { DemoTag } from "@/components/ui/DemoTag";
import { BEAT_W, beatPath } from "./geometry";
import { LOG_VISIBLE, formatUptime, logLine } from "./log";

/** Step 4: a small dashboard. Streaming logs, uptime counter and heartbeat graph (all DEMO). */
export function Dashboard() {
  const lines = Array.from({ length: LOG_VISIBLE }, (_, i) => logLine(i));
  return (
    <div className="how-dash">
      <div className="flex items-center gap-2.5 border-b border-line pb-3">
        <span className="relative inline-flex size-2.5 items-center justify-center">
          <span className="how-loop how-dot-ring absolute inset-0 rounded-full bg-live" />
          <span className="size-2 rounded-full bg-live" />
        </span>
        <span className="font-mono text-[13px] font-medium text-ink">{AGENT_NAME}</span>
        <span className="font-mono text-[12px] text-ink-muted">
          running · {DEMO.howTeamSize.value} agents
        </span>
        <DemoTag className="ml-auto" />
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] items-end gap-5">
        <div>
          <p className="font-mono text-[11px] tracking-wider text-ink-muted uppercase">Uptime</p>
          <p
            className="mt-1 font-mono text-xl font-medium text-ink tabular-nums"
            data-uptime={DEMO.howUptimeSeconds.value}
          >
            {formatUptime(DEMO.howUptimeSeconds.value)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[11px] tracking-wider text-ink-muted uppercase">Heartbeat</p>
          <div className="mt-1 h-10 overflow-hidden">
            <svg
              viewBox={`0 0 ${BEAT_W * 3} 44`}
              preserveAspectRatio="none"
              className="h-10 w-full overflow-visible"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className="how-loop how-ecg"
                d={beatPath(4)}
                fill="none"
                stroke="var(--color-live)"
                strokeWidth={1.5}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
      <ol className="how-log" data-next={LOG_VISIBLE}>
        {lines.map((l, i) => (
          <li key={i}>
            <span className="text-ink-muted">{l.time}</span>
            <span className={l.level === "warn" ? "how-warn" : "text-ink-muted"}>{l.level}</span>
            <span className="truncate text-ink">{l.msg}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
