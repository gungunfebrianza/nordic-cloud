/**
 * Decides which agent films may autoplay. Desktop: every film at least 50% visible plays.
 * Under 768px: only the most-visible one plays, so a phone decodes one video at a time.
 */

export type Playable = { ratio: number; play: () => void; pause: () => void };

const entries = new Set<Playable>();
const MOBILE = "(max-width: 767px)";
export const PLAY_AT = 0.5;

export function register(p: Playable): () => void {
  entries.add(p);
  return () => {
    entries.delete(p);
    p.pause();
    update();
  };
}

export function update() {
  const mobile = window.matchMedia(MOBILE).matches;
  let best: Playable | undefined;
  if (mobile) {
    for (const e of entries) if (e.ratio >= PLAY_AT && (!best || e.ratio > best.ratio)) best = e;
  }
  for (const e of entries) {
    const on = mobile ? e === best : e.ratio >= PLAY_AT;
    if (on) e.play();
    else e.pause();
  }
}
