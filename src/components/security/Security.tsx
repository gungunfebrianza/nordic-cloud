import { Boxes, ClipboardCheck, GlobeLock, LifeBuoy, type LucideIcon } from "lucide-react";
import {
  SECURITY_BLOCKS,
  SECURITY_EYEBROW,
  SECURITY_HEADING,
  SECURITY_INTRO,
  type SecurityBlockId,
} from "@/content/security";
import { WithPlaceholders } from "@/components/ui/WithPlaceholders";
import { Certifications } from "./Certifications";
import { SecurityLog } from "./SecurityLog";
import { SecurityRunning } from "./SecurityRunning";
import { ShieldScene } from "./ShieldScene";
import { StatusWidget } from "./StatusWidget";

const ICONS: Record<SecurityBlockId, LucideIcon> = {
  residency: GlobeLock,
  isolation: Boxes,
  resilience: LifeBuoy,
  governance: ClipboardCheck,
};

/**
 * Four draft blocks (claims marked {{CONFIRM}}), the shield of nodes with its log, a demo status
 * widget, and the certifications row, which renders nothing until real entries exist.
 */
export function Security() {
  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      data-section="security"
      className="scroll-mt-16 border-b border-line"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <div className="sec-layout">
          <div className="sec-head">
            <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">
              {SECURITY_EYEBROW}
            </p>
            <h2
              id="security-heading"
              className="mt-3 max-w-[20ch] text-4xl leading-tight font-semibold text-ink sm:text-5xl"
            >
              {SECURITY_HEADING}
            </h2>
            <p className="mt-4 max-w-[52ch] text-lg text-ink-muted">{SECURITY_INTRO}</p>
          </div>

          <div className="sec-stage" data-sec-loop="">
            <ShieldScene />
            <SecurityLog />
          </div>

          <ul className="sec-blocks">
            {SECURITY_BLOCKS.map((b) => {
              const Icon = ICONS[b.id];
              return (
                <li key={b.id} className="sec-block" data-block={b.id}>
                  <span className="sec-icon">
                    <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{b.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                    <WithPlaceholders text={b.body} />
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-10">
          <StatusWidget />
        </div>
        <Certifications />
      </div>
      <SecurityRunning />
    </section>
  );
}
