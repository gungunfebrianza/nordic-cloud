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
  wideMedia,
  className = "relative",
}: {
  /** File stem in public/media, e.g. "vertical-economy". */
  name: string;
  /** What the film shows, for the play button ("Play Economy film"). */
  label: string;
  /** CSS aspect-ratio, default 4:5. */
  aspect?: string;
  /**
   * Media query where the box is landscape. There, NAME-poster-wide.avif (16:9, if it exists) is
   * shown instead, so the still matches the film's framing and nothing shifts when it starts.
   */
  wideMedia?: string;
  /** Must position the box (default "relative"); children are absolutely placed. */
  className?: string;
}) {
  const poster = `/media/${name}-poster.avif`;
  const wide =
    wideMedia && existsSync(path.join(MEDIA_DIR, `${name}-poster-wide.avif`))
      ? `/media/${name}-poster-wide.avif`
      : undefined;
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
      {/* The poster sits under the video (which has no poster of its own), so a media query can
          pick its framing; it also stays as the fallback if the film fails. */}
      <picture className="absolute inset-0">
        {wide && <source media={wideMedia} srcSet={wide} type="image/avif" />}
        <img src={poster} alt="" className="size-full object-cover" />
      </picture>
      {sources.length > 0 && <AgentVideoPlayer sources={sources} label={label} />}
    </div>
  );
}
