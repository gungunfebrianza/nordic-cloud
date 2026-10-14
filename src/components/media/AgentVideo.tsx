import { existsSync } from "node:fs";
import path from "node:path";
import { AgentVideoPlayer, type VideoSource } from "./AgentVideoPlayer";

const MEDIA_DIR = path.join(process.cwd(), "public", "media");

/**
 * A muted, looping agent film with an AVIF poster in a fixed aspect-ratio box (no layout shift).
 * Checks at build time which of NAME.webm / NAME.mp4 exist and renders only those sources, WebM
 * first. With no sources it renders the poster alone: no video element, no 404s.
 */
export function AgentVideo({
  name,
  label,
  aspect = "4 / 5",
  className = "relative",
}: {
  /** File stem in public/media, e.g. "vertical-economy". */
  name: string;
  /** What the film shows, for the play button ("Play Economy film"). */
  label: string;
  /** CSS aspect-ratio, default 4:5. */
  aspect?: string;
  /** Must position the box (default "relative"); children are absolutely placed. */
  className?: string;
}) {
  const poster = `/media/${name}-poster.avif`;
  const sources: VideoSource[] = (
    [
      ["webm", "video/webm"],
      ["mp4", "video/mp4"],
    ] as const
  )
    .filter(([ext]) => existsSync(path.join(MEDIA_DIR, `${name}.${ext}`)))
    .map(([ext, type]) => ({ src: `/media/${name}.${ext}`, type }));

  return (
    <div
      className={`agent-video overflow-hidden ${className}`}
      style={{ aspectRatio: aspect }}
      data-video={name}
    >
      {sources.length === 0 ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export, AVIF poster as-is
        <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <AgentVideoPlayer sources={sources} poster={poster} label={label} />
      )}
    </div>
  );
}
