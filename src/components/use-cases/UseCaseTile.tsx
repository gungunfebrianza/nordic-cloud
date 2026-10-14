import { AgentVideo } from "@/components/media/AgentVideo";
import { DemoTag } from "@/components/ui/DemoTag";
import type { Copy } from "@/content/copy-types";
import { USE_CASE_DEMO, USE_CASE_HREF, type UseCaseId } from "@/content/use-cases";

const TABLET = "(min-width: 768px) and (max-width: 1023px)";

/**
 * One vertical. The film fills the tile; name, outcome and jobs sit in a bottom overlay on an ink
 * scrim. "Read the playbook" stretches over the tile (one tab stop), so focus mirrors hover.
 * Jobs are always in the DOM as text; the typed copy beside each is visual only.
 */
export function UseCaseTile({ id, index, t }: { id: UseCaseId; index: number; t: Copy }) {
  const u = t.useCases.items[id];
  const titleId = `use-case-${id}-title`;
  return (
    <article
      className="use-case-tile"
      data-use-case={id}
      data-index={index}
      aria-labelledby={titleId}
    >
      <AgentVideo
        name={`vertical-${id}`}
        playLabel={t.useCases.play(u.name)}
        pauseLabel={t.useCases.pause(u.name)}
        aspect="auto"
        // Economy is a 16:9 full-width tile on tablets (use-cases.css), so it gets the wide still there.
        wideMedia={id === "economy" ? TABLET : undefined}
        className="absolute inset-0"
      />
      <div className="use-case-scrim" aria-hidden="true" />
      <div className="use-case-overlay">
        <h3 id={titleId} className="text-xl font-semibold text-surface">
          {u.name}
        </h3>
        <p className="mt-1 text-[15px] text-surface">
          {u.outcome}
          {USE_CASE_DEMO[id] && (
            <DemoTag
              label={t.common.demoTag}
              title={t.common.demoTitle}
              className="ml-2 align-middle !text-surface/80"
            />
          )}
        </p>
        <ul className="use-case-jobs mt-3 space-y-1 font-mono text-[12px] text-surface">
          {u.jobs.map((job) => (
            <li key={job}>
              <span className="sr-only">{job}</span>
              <span className="use-case-job" aria-hidden="true" data-job={job}>
                {job}
              </span>
            </li>
          ))}
        </ul>
        <a href={USE_CASE_HREF[id]} className="use-case-link">
          {t.useCases.playbook}
          <span className="sr-only">: {u.name}</span> <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
