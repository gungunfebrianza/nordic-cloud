"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Click-to-play only: poster first, preload="none", native visible controls, captions track.
 * The large button just starts playback; nothing ever plays on its own.
 */
export function BrandFilmPlayer({
  sources,
  captions,
  poster,
  brand,
}: {
  sources: { src: string; type: string }[];
  captions: string;
  poster: string;
  brand: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  return (
    <>
      <video
        ref={video}
        className="size-full object-cover"
        poster={poster}
        preload="none"
        controls
        playsInline
        onPlay={() => setStarted(true)}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
        <track kind="captions" src={captions} srcLang="en" label="English" />
      </video>
      {!started && (
        <button
          type="button"
          className="how-film-play"
          onClick={() => void video.current?.play()}
          aria-label={`Play the ${brand} film`}
        >
          <Play size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    </>
  );
}
