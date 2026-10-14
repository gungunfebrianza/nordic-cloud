/**
 * Lazy chunk for #pricing. No motion library.
 *
 * What the motion explains: when a toggle changes, each price counts from its old value to its new
 * one (300 ms, entrance easing, tabular figures), so you see how far it moved. Only for prices that
 * are real numbers (data-n); placeholders just switch. Instant under reduced motion. Screen readers
 * never hear the moving digits: the visual copy is aria-hidden, and a polite live region speaks the
 * final prices once.
 */
import { formatPrice, type Currency } from "@/lib/pricing";

export const PRICING_MOTION_ID = "pricing-motion";
export const COUNT_MS = 300;

/** cubic-bezier(0.22, 1, 0.36, 1), the brand's entrance easing. */
function entrance(x: number): number {
  const [x1, y1, x2, y2] = [0.22, 1, 0.36, 1];
  const bez = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, x1, x2) < x) lo = mid;
    else hi = mid;
  }
  return bez((lo + hi) / 2, y1, y2);
}

/** The variant CSS is currently showing in a card. */
const visible = (card: Element) =>
  [...card.querySelectorAll<HTMLElement>(".price-v")].find((el) => el.offsetParent !== null);

const num = (el: HTMLElement | undefined) =>
  el?.dataset.n === undefined ? null : Number(el.dataset.n);

export function mountPricingMotion(section: HTMLElement): () => void {
  section.dataset.motion = PRICING_MOTION_ID;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intl = section.dataset.intl ?? "en-GB";
  const cards = [...section.querySelectorAll<HTMLElement>(".price-card")];
  const live = section.querySelector<HTMLElement>("[data-pricing-live]");
  const shown = new Map(cards.map((c) => [c, num(visible(c))]));
  const frames = new Map<HTMLElement, number>();

  const onChange = () => {
    for (const card of cards) {
      const el = visible(card);
      const from = shown.get(card) ?? null;
      const to = num(el);
      shown.set(card, to);
      if (!el || to === null) continue;
      const anim = el.querySelector<HTMLElement>(".price-anim")!;
      const final = el.querySelector(".sr-only")!.textContent ?? "";
      const currency = el.dataset.c as Currency;
      cancelAnimationFrame(frames.get(anim) ?? 0);
      if (reduce || from === null || from === to) {
        anim.textContent = final;
        continue;
      }
      const t0 = performance.now();
      anim.dataset.counting = "";
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / COUNT_MS);
        anim.textContent =
          p < 1 ? formatPrice(Math.round(from + (to - from) * entrance(p)), currency, intl) : final;
        if (p < 1) frames.set(anim, requestAnimationFrame(step));
        else delete anim.dataset.counting;
      };
      frames.set(anim, requestAnimationFrame(step));
    }

    // One announcement with the final values: "Always-on bots: €49/mo, …".
    if (live) {
      const unit = section.querySelector(".price-unit")?.textContent ?? "";
      const prices = cards
        .map((card) => {
          const name = card.querySelector("h3")?.textContent ?? "";
          const value = visible(card)?.querySelector(".sr-only")?.textContent ?? "";
          return `${name}: ${value}${unit}`;
        })
        .join(", ");
      live.textContent = (live.dataset.pricingLive ?? "{prices}").replace("{prices}", prices);
    }
  };

  section.addEventListener("change", onChange);
  return () => {
    section.removeEventListener("change", onChange);
    for (const id of frames.values()) cancelAnimationFrame(id);
    delete section.dataset.motion;
  };
}
