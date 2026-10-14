"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PLAY_AT, register, update, type Playable } from "./video-coordinator";

export type VideoSource = { src: string; type: string };

/** AbortError just means a pause() beat play(); only an unplayable file falls back. */
const failOn = (setFailed: (v: boolean) => void) => (e: unknown) => {
  if ((e as Error)?.name === "NotSupportedError") setFailed(true);
};

/**
 * Autoplays muted while at least half visible, pauses below. Sources attach only when the film
 * first comes near the viewport. With reduced motion or Save-Data it never autoplays: a play
 * button toggles it instead. Any playback error removes the video, leaving the poster beneath.
 * The video has no poster attribute: it is transparent until its first frame, so the poster
 * <picture> underneath (which can switch framing by media query) is what shows before playback.
 */
export function AgentVideoPlayer({ sources, label }: { sources: VideoSource[]; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [attached, setAttached] = useState(false);
  const [manual, setManual] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const pendingPlay = useRef(false);

  // Sources just attached: load them, then resume whatever should be playing.
  useEffect(() => {
    const video = ref.current;
    if (!attached || !video) return;
    video.load();
    if (pendingPlay.current) {
      pendingPlay.current = false;
      void video.play().catch(failOn(setFailed));
    } else update();
  }, [attached]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const onError = () => setFailed(true);
    // Capture: <source> errors don't bubble.
    video.addEventListener("error", onError, true);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    const saveData = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData;
    const isManual = !!saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setManual(isManual);

    const near = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        near.disconnect();
        setAttached(true);
      },
      { rootMargin: "300px 0px" },
    );
    near.observe(video);

    const pause = () => video.pause();
    const entry: Playable = {
      ratio: 0,
      play: () => void video.play().catch(() => {}),
      pause,
    };
    const unregister = isManual ? undefined : register(entry);
    const seen = new IntersectionObserver(
      ([e]) => {
        entry.ratio = e?.intersectionRatio ?? 0;
        if (isManual) {
          if (entry.ratio < PLAY_AT) pause();
        } else update();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    seen.observe(video);

    return () => {
      near.disconnect();
      seen.disconnect();
      unregister?.();
      video.removeEventListener("error", onError, true);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // The poster underneath (AgentVideo) shows through.
  if (failed) return null;

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (!attached) {
      pendingPlay.current = true;
      setAttached(true);
    } else if (video.paused) void video.play().catch(failOn(setFailed));
    else video.pause();
  };

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 size-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        data-state={playing ? "playing" : "paused"}
      >
        {attached && sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
      </video>
      {manual && (
        <button
          type="button"
          onClick={toggle}
          aria-label={`${playing ? "Pause" : "Play"} ${label}`}
          className="agent-video-toggle"
        >
          {playing ? (
            <Pause size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Play size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      )}
    </>
  );
}
