"use client";

import { Suspense, lazy, useEffect, useState } from "react";

const Controller = lazy(() => import("./how-scroll"));

const DESKTOP = "(min-width: 1024px)";

/**
 * Initial-bundle part of #how; tiny. Two jobs:
 * - Desktop: after load + idle, once #how is near the viewport, lazy-loads the useScroll
 *   controller that drives the sticky panel. (It loads under reduced motion too: the panel still
 *   has to follow the steps, just without animation.)
 * - Mobile: runs each step visual's loops only while it is on screen, and fades visuals up once
 *   if they start below the fold. No motion library on phones.
 */
export function HowScroll() {
  const [section, setSection] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById("how");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop = window.matchMedia(DESKTOP);
    const stopVisuals = watchVisuals(el, reduce);

    let idleId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || !desktop.matches) return;
        io.disconnect();
        setSection(el);
      },
      { rootMargin: "600px 0px" },
    );
    const watch = () => io.observe(el);
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(watch, { timeout: 2000 });
      } else {
        idleId = setTimeout(watch, 300) as unknown as number;
      }
    };
    // A window resized to desktop width re-checks.
    const onChange = () => {
      if (!desktop.matches) return;
      io.unobserve(el);
      io.observe(el);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("load", whenIdle);
      desktop.removeEventListener("change", onChange);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      clearTimeout(idleId);
      io.disconnect();
      stopVisuals();
    };
  }, []);

  return section ? (
    <Suspense fallback={null}>
      <Controller section={section} />
    </Suspense>
  ) : null;
}

function watchVisuals(section: HTMLElement, reduce: boolean) {
  const visuals = [...section.querySelectorAll<HTMLElement>(".how-visual")];
  if (reduce) return () => {};
  for (const v of visuals) {
    const r = v.getBoundingClientRect();
    // Never hide something already on screen (or hidden by the desktop layout).
    if (r.height > 0 && r.top > window.innerHeight) v.dataset.armed = "true";
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLElement;
        v.dataset.running = String(e.isIntersecting);
        if (e.isIntersecting && e.intersectionRatio >= 0.2) delete v.dataset.armed;
      }
    },
    { threshold: [0, 0.2] },
  );
  for (const v of visuals) io.observe(v);
  return () => io.disconnect();
}
