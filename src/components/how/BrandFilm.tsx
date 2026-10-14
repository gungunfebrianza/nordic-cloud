import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Copy } from "@/content/copy-types";
import { BRAND } from "@/content/site";
import { BrandFilmPlayer } from "./BrandFilmPlayer";

const MEDIA = "/media";
const has = (file: string) => existsSync(join(process.cwd(), "public", MEDIA, file));

/**
 * The brand film at the end of #how. Checked at build time: until public/media holds the film
 * and its captions (see public/media/README.md), the frame shows the poster and "Film coming
 * soon". Once they are there, it becomes a click-to-play player. Never autoplays.
 */
export function BrandFilm({ t }: { t: Copy }) {
  const sources = [
    has("brand-film.webm") && { src: `${MEDIA}/brand-film.webm`, type: "video/webm" },
    has("brand-film.mp4") && { src: `${MEDIA}/brand-film.mp4`, type: "video/mp4" },
  ].filter((s): s is { src: string; type: string } => !!s);
  const captions = has("brand-film.en.vtt") ? `${MEDIA}/brand-film.en.vtt` : null;
  const poster = `${MEDIA}/brand-film-poster.avif`;
  const ready = sources.length > 0 && captions !== null;

  return (
    <figure className="how-film mt-24" data-film={ready ? "ready" : "coming-soon"}>
      <div className="how-film-frame">
        {ready ? (
          <BrandFilmPlayer
            sources={sources}
            captions={captions}
            poster={poster}
            playLabel={t.how.filmPlay(BRAND)}
            captionsLabel={t.how.captionsLabel}
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized AVIF poster */}
            <img
              src={poster}
              alt=""
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
            <span className="how-film-soon">{t.how.filmSoon}</span>
          </>
        )}
      </div>
      <figcaption className="mt-3 font-mono text-xs text-ink-muted">
        {t.how.filmCaption(BRAND)}
        {ready ? ` · ${t.how.filmCaptionsAvailable}` : ""}
      </figcaption>
    </figure>
  );
}
