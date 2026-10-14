/**
 * Analytics: off by default. One flag and two values, all baked in at build:
 *
 *   NEXT_PUBLIC_ANALYTICS       off (default) | plausible | umami
 *   NEXT_PUBLIC_ANALYTICS_SRC   the script's path ON THIS SITE'S OWN DOMAIN, e.g. /js/script.js
 *                               (Plausible proxied by the host) or /umami/script.js (self-hosted Umami)
 *   NEXT_PUBLIC_ANALYTICS_SITE  Plausible: the domain (data-domain). Umami: the website id.
 *
 * Off: nothing renders and nothing loads. On: one deferred script, injected after the page's load
 * event, outside the initial JS. It must come from the site's own origin so the page still makes no
 * third-party requests; the build fails otherwise. Both tools are cookieless; add no other trackers.
 *
 * Cookieless does not settle consent. Confirm ePrivacy/GDPR requirements with counsel before enabling.
 */
export type AnalyticsConfig = {
  provider: "plausible" | "umami";
  src: string;
  /** Attributes for the script tag. */
  attrs: Record<string, string>;
};

/** Validates the env values. Returns null when off; throws on a misconfiguration. */
export function parseAnalytics(env: {
  NEXT_PUBLIC_ANALYTICS?: string;
  NEXT_PUBLIC_ANALYTICS_SRC?: string;
  NEXT_PUBLIC_ANALYTICS_SITE?: string;
}): AnalyticsConfig | null {
  const provider = (env.NEXT_PUBLIC_ANALYTICS ?? "off").trim() || "off";
  if (provider === "off") return null;
  if (provider !== "plausible" && provider !== "umami")
    throw new Error(`NEXT_PUBLIC_ANALYTICS must be off, plausible or umami (got "${provider}")`);
  const src = (env.NEXT_PUBLIC_ANALYTICS_SRC ?? "").trim();
  // Same origin only: a root-relative path, never a protocol-relative or absolute URL.
  if (!/^\/(?!\/)[^\s]*$/.test(src))
    throw new Error(
      `NEXT_PUBLIC_ANALYTICS_SRC must be a path on the site's own domain, like /js/script.js (got "${src}")`,
    );
  const site = (env.NEXT_PUBLIC_ANALYTICS_SITE ?? "").trim();
  if (!site) throw new Error("NEXT_PUBLIC_ANALYTICS_SITE is required when analytics is on");
  return {
    provider,
    src,
    attrs: provider === "plausible" ? { "data-domain": site } : { "data-website-id": site },
  };
}

/**
 * The build's setting. Read with literal process.env names so Next inlines them.
 */
export const ANALYTICS = parseAnalytics({
  NEXT_PUBLIC_ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS,
  NEXT_PUBLIC_ANALYTICS_SRC: process.env.NEXT_PUBLIC_ANALYTICS_SRC,
  NEXT_PUBLIC_ANALYTICS_SITE: process.env.NEXT_PUBLIC_ANALYTICS_SITE,
});
