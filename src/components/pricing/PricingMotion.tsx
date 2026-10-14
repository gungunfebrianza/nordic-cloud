"use client";

import { useEffect } from "react";

/**
 * Renders nothing. After load + idle, once #pricing is near the viewport, lazy-loads the count-up
 * chunk. Without it the toggles still switch everything (CSS); numbers just change instantly.
 */
export function PricingMotion() {
  useEffect(() => {
    const section = document.getElementById("pricing");
    if (!section) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let idleId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        import("./pricing-motion")
          .then(({ mountPricingMotion }) => {
            if (!cancelled) cleanup = mountPricingMotion(section);
          })
          .catch(() => {});
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
