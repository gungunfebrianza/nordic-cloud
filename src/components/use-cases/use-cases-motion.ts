/**
 * Lazy chunk for #use-cases. No motion library: plain DOM and rAF.
 *
 * What each motion explains: the jobs type in line by line, like an agent's log, to show the work
 * it does. Desktop: on hover/focus, reset on leave. Mobile: once, when a tile snaps to centre.
 * Reduced motion: the text appears at once. The screen-reader copy (sr-only) never changes.
 */

export const USE_CASES_MOTION_ID = "use-cases-motion";
export const TYPE_MS_PER_CHAR = 18;

const MOBILE = "(max-width: 767px)";

export function mountUseCasesMotion(section: HTMLElement): () => void {
  section.dataset.motion = USE_CASES_MOTION_ID;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiles = [...section.querySelectorAll<HTMLElement>(".use-case-tile")];
  const teardown: (() => void)[] = [];
  const typers = new Map<HTMLElement, Typer>();

  for (const tile of tiles) {
    const typer = makeTyper(tile, reduce);
    typers.set(tile, typer);
    typer.clear();

    // Desktop: hover and keyboard focus both type; leaving resets.
    const sync = () => {
      if (window.matchMedia(MOBILE).matches) return;
      if (tile.matches(":hover") || tile.matches(":focus-within")) typer.start();
      else typer.clear();
    };
    // focusout fires before focus moves; check on the next frame.
    const onEvent = () => requestAnimationFrame(sync);
    const events = ["pointerenter", "pointerleave", "focusin", "focusout"] as const;
    for (const e of events) tile.addEventListener(e, onEvent);
    teardown.push(() => {
      for (const e of events) tile.removeEventListener(e, onEvent);
      typer.cancel();
    });
  }

  // Mobile carousel: counter follows the centred tile; a tile types once when it snaps there.
  const grid = section.querySelector<HTMLElement>(".use-case-grid");
  const counter = section.querySelector<HTMLElement>("[data-counter]");
  if (grid) {
    const typed = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        if (!window.matchMedia(MOBILE).matches) return;
        for (const e of entries) {
          if (e.intersectionRatio < 0.9) continue;
          const tile = e.target as HTMLElement;
          if (counter) counter.textContent = String(Number(tile.dataset.index) + 1);
          if (!typed.has(tile)) {
            typed.add(tile);
            typers.get(tile)?.start();
          }
        }
      },
      { root: grid, threshold: [0.9] },
    );
    for (const tile of tiles) io.observe(tile);
    teardown.push(() => io.disconnect());
  }

  return () => {
    for (const t of teardown) t();
    delete section.dataset.motion;
    for (const typer of typers.values()) typer.fill();
  };
}

type Typer = { start: () => void; clear: () => void; fill: () => void; cancel: () => void };

function makeTyper(tile: HTMLElement, instant: boolean): Typer {
  const spans = [...tile.querySelectorAll<HTMLElement>("[data-job]")];
  const texts = spans.map((s) => s.dataset.job ?? "");
  let raf = 0;
  let running = false;

  const render = (chars: number) => {
    let left = chars;
    spans.forEach((s, i) => {
      const t = texts[i] ?? "";
      s.textContent = t.slice(0, Math.max(0, left));
      left -= t.length;
    });
  };
  const total = texts.reduce((n, t) => n + t.length, 0);
  const cancel = () => {
    cancelAnimationFrame(raf);
    running = false;
  };

  return {
    start() {
      if (running) return;
      if (instant) return render(total);
      running = true;
      const t0 = performance.now();
      const step = (now: number) => {
        const n = Math.floor((now - t0) / TYPE_MS_PER_CHAR);
        render(n);
        tile.dataset.typed = String(Math.min(n, total));
        if (n < total) raf = requestAnimationFrame(step);
        else running = false;
      };
      raf = requestAnimationFrame(step);
    },
    clear() {
      cancel();
      render(0);
      tile.dataset.typed = "0";
    },
    fill() {
      cancel();
      render(total);
    },
    cancel,
  };
}
