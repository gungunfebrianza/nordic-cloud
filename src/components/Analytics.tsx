"use client";

import { useEffect } from "react";
import type { AnalyticsConfig } from "@/lib/analytics";

/**
 * Injects the one analytics script after the page's load event, deferred, from the site's own
 * origin. Only rendered when analytics is on (Page.tsx); with it off this never reaches the page.
 */
export function Analytics({ config }: { config: AnalyticsConfig }) {
  useEffect(() => {
    const inject = () => {
      const s = document.createElement("script");
      s.src = config.src;
      s.defer = true;
      for (const [k, v] of Object.entries(config.attrs)) s.setAttribute(k, v);
      s.dataset.analytics = config.provider;
      document.body.appendChild(s);
    };
    if (document.readyState === "complete") inject();
    else window.addEventListener("load", inject, { once: true });
    return () => window.removeEventListener("load", inject);
  }, [config]);
  return null;
}
