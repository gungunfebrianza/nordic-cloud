"use client";

import { useEffect } from "react";

/**
 * Renders nothing. Sets data-running on each [data-sec-loop] element in #security while it is on
 * screen, which is what starts its CSS loops. Never under reduced motion, so the still frame stays.
 */
export function SecurityRunning() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const loops = document.querySelectorAll<HTMLElement>("#security [data-sec-loop]");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.target as HTMLElement).dataset.running = String(e.isIntersecting);
    });
    loops.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
