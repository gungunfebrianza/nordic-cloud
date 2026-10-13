"use client";

import { useEffect } from "react";

/**
 * Renders nothing. After the page has loaded and the browser is idle, and once #products is near
 * the viewport, lazy-loads the motion chunk that animates the server-rendered diagrams. Never
 * competes with first paint or hydration. Skipped entirely under prefers-reduced-motion.
 */
export function ProductsMotion() {
  useEffect(() => {
    const section = document.getElementById("products");
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let idleId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        import("./products-motion")
          .then(({ mountProductsMotion }) => {
            if (!cancelled) cleanup = mountProductsMotion(section);
          })
          .catch(() => {}); // static diagrams stay; nothing breaks
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
