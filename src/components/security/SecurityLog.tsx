import { DEMO_SECURITY_LOG } from "@/content/demo";
import type { Copy } from "@/content/copy-types";
import { DemoTag } from "@/components/ui/DemoTag";
import { sentinelName } from "./shield-geometry";

const line = (e: (typeof DEMO_SECURITY_LOG.value)[number]) =>
  `blocked · ${e.threat} · ${sentinelName(e.sentinel)}`;

/**
 * The mono log beside the shield. Four lines are visible; the strip holds the four events twice
 * and steps up one line per heartbeat, in time with each catch, so the loop is seamless.
 * Screen readers get the four events once, as a plain list; the moving copy is hidden from them.
 */
export function SecurityLog({ t }: { t: Copy }) {
  const events = DEMO_SECURITY_LOG.value;
  return (
    <div className="sec-log">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-wider text-ink-muted uppercase">
          {t.security.logTitle}
        </p>
        <DemoTag label={t.common.demoTag} title={t.common.demoTitle} />
      </div>
      <ul className="sr-only">
        {events.map((e) => (
          <li key={e.sentinel}>{line(e)}</li>
        ))}
      </ul>
      <div className="sec-log-window mt-2" aria-hidden="true">
        <ol className="sec-log-strip">
          {[...events, ...events].map((e, i) => (
            <li key={i} className="sec-log-line" data-line={i % events.length}>
              <span className="text-ink">blocked</span> · {e.threat} ·{" "}
              <span className="text-signal">{sentinelName(e.sentinel)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
