"use client";

/**
 * Lazy chunk for #how (desktop only, never in the initial bundle). motion's useScroll reads how
 * far the steps column has scrolled past the middle of the viewport; that progress picks the
 * panel's state (data-step 1–4) and fills the progress rail. Scrolling itself is untouched.
 *
 * The state morphs are CSS transitions keyed on data-step (how.css). This chunk adds the parts
 * that need a clock, each explaining something:
 *   step 1 → the config types itself out (what the agent is)
 *   step 4 → log lines stream one per heartbeat and the uptime counts up (it is running, watched)
 * Under reduced motion the states still follow the scroll, but nothing types, streams or counts.
 */

import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef } from "react";
import { DEMO } from "@/content/demo";
import { HEARTBEAT_MS } from "@/lib/motion-constants";
import { LOG_VISIBLE, formatUptime, logLine } from "./log";

export const HOW_SCROLL_ID = "how-scroll";
const STEPS = 4;
const HYSTERESIS = 0.03; // of total progress: stops flicker at step boundaries
const TYPE_CPS = 120; // characters per second: the whole file in about 3.5 s

export default function HowScrollController({ section }: { section: HTMLElement }) {
  const steps = useRef(section.querySelector<HTMLElement>(".how-steps"));
  const { scrollYProgress } = useScroll({ target: steps, offset: ["start center", "end center"] });
  const api = useRef<ReturnType<typeof mount> | null>(null);

  useEffect(() => {
    api.current = mount(section);
    api.current.progress(scrollYProgress.get());
    return () => {
      api.current?.destroy();
      api.current = null;
    };
  }, [section, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (p) => api.current?.progress(p));
  return null;
}

function mount(section: HTMLElement) {
  const panel = section.querySelector<HTMLElement>(".how-panel")!;
  const stepEls = [...section.querySelectorAll<HTMLElement>(".how-step")];
  const fill = panel.querySelector<HTMLElement>(".how-rail-fill");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typing = reduce ? null : armTyping(panel);
  const dash = reduce ? null : dashboard(panel);

  section.dataset.scroll = HOW_SCROLL_ID;
  panel.dataset.live = "true";
  let step = 0;
  let visible = false;

  const sync = () => {
    const running = visible && document.visibilityState === "visible";
    panel.dataset.running = String(running);
    if (running && step === 1) typing?.start();
    if (step !== 1) typing?.finish();
    dash?.run(running && step === 4);
  };

  const setStep = (n: number) => {
    if (n === step) return;
    step = n;
    panel.dataset.step = String(n);
    for (const el of stepEls) {
      const on = Number(el.dataset.n) === n;
      el.toggleAttribute("data-current", on);
      if (on) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    }
    sync();
  };

  const io = new IntersectionObserver(
    ([e]) => {
      visible = !!e?.isIntersecting && e.intersectionRatio >= 0.4;
      sync();
    },
    { threshold: [0, 0.4] },
  );
  io.observe(panel);
  document.addEventListener("visibilitychange", sync);

  return {
    progress(p: number) {
      if (fill) fill.style.scale = `${Math.min(1, Math.max(0, p))} 1`;
      // Step n owns progress [(n-1)/4, n/4). Leave the current step only past a small margin.
      if (step) {
        const lo = (step - 1) / STEPS - HYSTERESIS;
        const hi = step / STEPS + HYSTERESIS;
        if (p >= lo && p < hi) return;
      }
      setStep(Math.min(STEPS, Math.max(1, Math.floor(p * STEPS) + 1)));
    },
    destroy() {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      typing?.finish();
      dash?.run(false);
    },
  };
}

/**
 * Types the config out the first time step 1 is seen. Armed only if the panel is still below the
 * fold at mount, so text that is already on screen is never blanked.
 */
function armTyping(panel: HTMLElement) {
  const code = panel.querySelector<HTMLElement>(".how-code-pre code");
  const caret = code?.querySelector<HTMLElement>(".how-caret");
  if (!code || !caret || panel.getBoundingClientRect().top < window.innerHeight * 0.5) return null;

  const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  const nodes: { node: Text; text: string; line: Element | null }[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    nodes.push({ node, text: node.data, line: node.parentElement!.closest(".how-code-line") });
    node.data = "";
  }
  const lines = [...code.querySelectorAll(".how-code-line")];
  for (const l of lines) l.setAttribute("data-pending", "");
  const total = nodes.reduce((n, t) => n + t.text.length, 0);
  let raf = 0;
  let started = false;
  let done = false;

  const render = (chars: number) => {
    let left = chars;
    let last: Text | null = null;
    for (const t of nodes) {
      const take = Math.max(0, Math.min(t.text.length, left));
      if (t.node.data.length !== take) t.node.data = t.text.slice(0, take);
      left -= take;
      if (take > 0) {
        last = t.node;
        t.line?.removeAttribute("data-pending");
      }
    }
    // The caret follows the last typed character.
    const parent = last?.parentElement;
    if (parent && caret.previousSibling !== parent) parent.after(caret);
  };

  const finish = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    render(total);
    for (const l of lines) l.removeAttribute("data-pending");
    code.appendChild(caret);
    delete panel.dataset.typing;
  };

  panel.dataset.typing = "armed";
  return {
    start() {
      if (started || done) return;
      started = true;
      panel.dataset.typing = "true";
      const t0 = performance.now();
      const tick = (now: number) => {
        const chars = Math.floor(((now - t0) / 1000) * TYPE_CPS);
        if (chars >= total) return finish();
        render(chars);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    },
    finish,
  };
}

/** Step 4: one new log line per heartbeat (oldest drops off) and a ticking uptime counter. */
function dashboard(panel: HTMLElement) {
  const log = panel.querySelector<HTMLOListElement>(".how-log");
  const uptime = panel.querySelector<HTMLElement>("[data-uptime]");
  if (!log || !uptime) return null;
  const startUptime = DEMO.howUptimeSeconds.value;
  const t0 = performance.now();
  let next = LOG_VISIBLE;
  let timers: number[] = [];

  const push = () => {
    const first = log.firstElementChild;
    const tpl = log.lastElementChild;
    if (!first || !tpl) return;
    const li = tpl.cloneNode(true) as HTMLLIElement;
    const [time, level, msg] = li.children as unknown as HTMLElement[];
    const l = logLine(next++);
    time!.textContent = l.time;
    level!.textContent = l.level;
    level!.className = l.level === "warn" ? "how-warn" : "text-ink-muted";
    msg!.textContent = l.msg;
    li.classList.add("how-log-new");
    log.appendChild(li);
    first.remove();
  };
  const tickUptime = () => {
    uptime.textContent = formatUptime(startUptime + Math.floor((performance.now() - t0) / 1000));
  };

  return {
    run(on: boolean) {
      if (on === timers.length > 0) return;
      if (!on) {
        timers.forEach(clearInterval);
        timers = [];
        return;
      }
      tickUptime();
      timers = [window.setInterval(push, HEARTBEAT_MS), window.setInterval(tickUptime, 1000)];
    },
  };
}
