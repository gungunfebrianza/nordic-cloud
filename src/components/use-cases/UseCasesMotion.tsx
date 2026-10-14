"use client";

import { useEffect } from "react";

/**
 * Renders nothing. After load + idle, once #use-cases is near the viewport, lazy-loads the small
 * chunk that types the jobs on hover/focus and drives the mobile carousel counter. Without it the
 * jobs simply show as plain text.
 */
export function UseCasesMotion() {
  useEffect(() => {
    const section = document.getElementById("use-cases");
    if (!section) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let idleId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        import("./use-cases-motion")
          .then(({ mountUseCasesMotion }) => {
            if (!cancelled) cleanup = mountUseCasesMotion(section);
          })
          .catch(() => {}); // jobs stay as plain text
      },
      { rootMargin: "400px 0px" },
    );
    const watch = () => io.observe(section);
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(watch, { timeout: 2000 });
      } else {
        idleId = setTimeout(watch, 300) as unknown as number;
      }
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", whenIdle);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      clearTimeout(idleId);
      io.disconnect();
      cleanup?.();
    };
  }, []);
  return null;
}
