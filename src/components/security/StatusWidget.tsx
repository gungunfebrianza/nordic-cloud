import { ArrowUpRight } from "lucide-react";
import { DEMO_UPTIME_90D } from "@/content/demo";
import type { Copy } from "@/content/copy-types";
import { STATUS_URL, isPlaceholder } from "@/content/security";
import { DemoTag } from "@/components/ui/DemoTag";

const BAR = 3;
const GAP = 1;

/**
 * Compact status card: a live dot on the heartbeat and a 90-day strip. DEMO data until it is
 * wired to a real status source. It links to STATUS_URL only once that is a real https URL; a
 * placeholder href would be a broken link.
 */
export function StatusWidget({ t }: { t: Copy }) {
  const s = t.security;
  const days = DEMO_UPTIME_90D.value;
  const degraded = days.filter((d) => d === "degraded").length;
  const summary = s.statusSummary(days.length, days.length - degraded, degraded);
  const linked = !isPlaceholder(STATUS_URL) && STATUS_URL.startsWith("https://");

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="sec-dot" aria-hidden="true">
          <span className="sec-dot-ring" />
        </span>
        <p className="font-medium text-ink">{s.statusTitle}</p>
        <DemoTag label={t.common.demoTag} title={t.common.demoTitle} />
        {linked && (
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-signal">
            {s.statusLink}
            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${days.length * (BAR + GAP) - GAP} 24`}
        preserveAspectRatio="none"
        className="mt-4 block h-6 w-full"
        role="img"
        aria-label={summary}
      >
        {days.map((d, i) => (
          <rect
            key={i}
            x={i * (BAR + GAP)}
            y={0}
            width={BAR}
            height={24}
            rx={1}
            className={d === "degraded" ? "fill-alert" : "fill-live"}
            fillOpacity={d === "degraded" ? 0.75 : 0.85}
            data-day={d}
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-muted">
        <span>{s.daysAgo(days.length)}</span>
        <span>{s.today}</span>
      </div>
    </>
  );

  return linked ? (
    <a href={STATUS_URL} className="sec-status sec-status-link" data-sec-loop="">
      {body}
    </a>
  ) : (
    <div className="sec-status" data-sec-loop="">
      {body}
    </div>
  );
}
