"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HeroCanvasHandle } from "./hero-canvas";

type StageState = "static" | "loading" | "live";

/**
 * Holds the static SVG snapshot (children, server-rendered) and upgrades it to the live canvas:
 * after the page has loaded, when the browser is idle, and once the stage is near the viewport.
 * The canvas module is a separate lazy chunk and never loads under prefers-reduced-motion.
 */
export function NetworkStage({ label, children }: { label: string; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<StageState>("static");

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const tooltip = tooltipRef.current;
    if (!stage || !canvas || !tooltip) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let handle: HeroCanvasHandle | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let idleId = 0;

    const mount = () => {
      if (cancelled || handle || reduce.matches) return;
      setState("loading");
      import("./hero-canvas")
        .then(({ mountHeroCanvas }) => {
          if (cancelled || reduce.matches) return;
          handle = mountHeroCanvas({ canvas, tooltip, onFirstFrame: () => setState("live") });
        })
        .catch(() => setState("static")); // the snapshot stays; nothing breaks
    };

    const whenNear = () => {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            io?.disconnect();
            mount();
          }
        },
        { rootMargin: "200px" },
      );
      io.observe(stage);
    };

    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(whenNear, { timeout: 1500 });
      } else {
        idleId = setTimeout(whenNear, 200) as unknown as number;
      }
    };

    const start = () => {
      if (reduce.matches) return;
      if (document.readyState === "complete") whenIdle();
      else window.addEventListener("load", whenIdle, { once: true });
    };

    // If the visitor turns reduced motion on, fall back to the snapshot.
    const onReduceChange = () => {
      if (reduce.matches) {
        handle?.destroy();
        handle = null;
        setState("static");
      } else start();
    };
    reduce.addEventListener("change", onReduceChange);
    start();

    return () => {
      cancelled = true;
      io?.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      clearTimeout(idleId);
      window.removeEventListener("load", whenIdle);
      reduce.removeEventListener("change", onReduceChange);
      handle?.destroy();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      role="img"
      aria-label={label}
      data-state={state}
      className="hero-stage relative h-[320px] w-full lg:h-[560px]"
    >
      {children}
      <canvas
        ref={canvasRef}
        className="hero-canvas absolute inset-0 size-full"
        aria-hidden="true"
      />
      <div
        ref={tooltipRef}
        className="hero-tooltip pointer-events-none absolute top-0 left-0 rounded-[10px] border border-line bg-surface/90 px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap text-ink shadow-[0_6px_20px_-10px_rgb(10_16_32/0.25)] backdrop-blur-sm"
        data-visible="false"
        aria-hidden="true"
      />
    </div>
  );
}
