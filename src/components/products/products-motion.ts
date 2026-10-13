/**
 * Lazy motion chunk for #products. Animates the server-rendered SVG diagrams with motion's
 * framework-free `animate()` from "motion/mini": it drives the browser's Web Animations API, so
 * transform and opacity loops run on the compositor, and the chunk stays small. Nothing here
 * lands in the initial bundle. Keyframes use the individual CSS transform properties
 * (rotate / translate / scale).
 *
 * What each motion explains:
 *   bots      → the hand sweeps a 24-hour day (4 heartbeats); scheduled tasks tick green as they run;
 *               the agent's heartbeat ring shows it is alive
 *   vps       → each resource lane streams live usage
 *   clusters  → packets show the orchestrator handing work around the team
 * Hover/focus runs a card's diagram at 1.5×. Loops pause when their card is off-screen.
 */

import { inView, stagger } from "motion";
import { animate } from "motion/mini";
import { DURATION, EASE, HEARTBEAT_S, STAGGER } from "@/lib/motion-constants";
import { CLUSTER, DIAL, VPS, agentPos } from "./diagrams/geometry";

type Controls = ReturnType<typeof animate>;

export const PRODUCTS_MOTION_ID = "products-motion";
const HOVER_SPEED = 1.5;
const loop = { ease: "linear", repeat: Infinity } as const;

export function mountProductsMotion(section: HTMLElement): () => void {
  section.dataset.motion = PRODUCTS_MOTION_ID;
  const cards = [...section.querySelectorAll<HTMLElement>(".product-card")];
  const teardown: (() => void)[] = [];
  const all: Controls[] = [];

  for (const card of cards) {
    const svg = card.querySelector<SVGSVGElement>(".product-diagram svg");
    if (!svg) continue;
    const id = card.dataset.product;
    const controls = id === "bots" ? bots(svg) : id === "vps" ? vps(svg) : clusters(svg);
    all.push(...controls);

    // Hover and keyboard focus both run the diagram at 1.5×.
    const setSpeed = () => {
      const active = card.matches(":hover") || card.matches(":focus-within");
      card.dataset.speed = String(active ? HOVER_SPEED : 1);
      for (const c of controls) c.speed = active ? HOVER_SPEED : 1;
    };
    const events = ["pointerenter", "pointerleave", "focusin", "focusout"] as const;
    // focusout fires before focus moves; check on the next frame.
    const onEvent = () => requestAnimationFrame(setSpeed);
    for (const e of events) card.addEventListener(e, onEvent);
    card.dataset.speed = "1";

    // Pause loops while the card is off-screen.
    const stopInView = inView(card, () => {
      card.dataset.running = "true";
      for (const c of controls) c.play();
      return () => {
        card.dataset.running = "false";
        for (const c of controls) c.pause();
      };
    });

    teardown.push(() => {
      stopInView();
      for (const e of events) card.removeEventListener(e, onEvent);
    });
  }

  // Cards stagger in once, but only if they haven't been seen yet (never hide visible content).
  const grid = cards[0]?.parentElement;
  if (grid && grid.getBoundingClientRect().top > window.innerHeight) {
    for (const card of cards) card.dataset.armed = "true";
    const stopEntrance = inView(
      grid,
      () => {
        stopEntrance();
        animate(
          cards,
          // `transform`, not `translate`: the hover lift owns `translate` (products.css).
          { opacity: [0, 1], transform: ["translateY(16px)", "none"] },
          {
            duration: DURATION.entrance,
            ease: [...EASE.entrance],
            delay: stagger(STAGGER.default),
          },
        );
        for (const card of cards) delete card.dataset.armed;
      },
      { amount: 0.15 },
    );
    teardown.push(stopEntrance);
  }

  return () => {
    for (const t of teardown) t();
    for (const c of all) c.stop();
  };
}

/** Always-on bots: hand sweep, task ticks, heartbeat ring. Starts where the snapshot rests. */
function bots(svg: SVGSVGElement): Controls[] {
  const out: Controls[] = [];
  const start = DIAL.restAt * DIAL.sweepS;

  const hand = svg.querySelector('[data-anim="hand"]');
  if (hand)
    out.push(animate(hand, { rotate: ["0deg", "360deg"] }, { duration: DIAL.sweepS, ...loop }));

  for (const tick of svg.querySelectorAll<SVGElement>('[data-anim="tick"]')) {
    const at = Number(tick.dataset.at);
    out.push(
      animate(
        tick,
        { opacity: [0, 0, 1, 1] },
        { duration: DIAL.sweepS, times: [0, at, Math.min(1, at + 0.004), 1], ...loop },
      ),
    );
  }

  const ring = svg.querySelector('[data-anim="ring"]');
  if (ring) {
    out.push(
      animate(
        ring,
        { scale: ["1", "2.12", "2.6"], opacity: [0.55, 0, 0] },
        { duration: HEARTBEAT_S, times: [0, 0.7, 1], ...loop },
      ),
    );
  }

  for (const c of out) c.time = start % (c.duration || DIAL.sweepS);
  return out;
}

/** Agent VPS: each lane's sparkline scrolls one pattern width per loop; lanes out of phase. */
function vps(svg: SVGSVGElement): Controls[] {
  return [...svg.querySelectorAll<SVGElement>('[data-anim="spark"]')].map((path, i) => {
    const c = animate(
      path,
      { translate: ["0px 0px", `${-VPS.spark.w}px 0px`] },
      { duration: VPS.loopS, ...loop },
    );
    c.time = (i * VPS.loopS) / VPS.lanes.length;
    return c;
  });
}

/** Clusters: packet i goes orchestrator → agent i → agent i+1 → orchestrator, 1.6 s per hop. */
function clusters(svg: SVGSVGElement): Controls[] {
  const loopS = CLUSTER.hopS * 3; // 4.8 s = 2 heartbeats
  return [...svg.querySelectorAll<SVGElement>('[data-anim="packet"]')].map((packet, i) => {
    const a = agentPos(i);
    const b = agentPos((i + 1) % CLUSTER.agents);
    const dx = (p: { x: number }) => p.x - CLUSTER.cx;
    const dy = (p: { y: number }) => p.y - CLUSTER.cy;
    const c = animate(
      packet,
      {
        translate: [a, b]
          .reduce((kf, p) => [...kf, `${dx(p)}px ${dy(p)}px`], ["0px 0px"])
          .concat("0px 0px"),
        opacity: [1, 1, 1, 1],
      },
      { duration: loopS, times: [0, 1 / 3, 2 / 3, 1], ...loop },
    );
    c.time = (i * loopS) / CLUSTER.agents;
    return c;
  });
}
