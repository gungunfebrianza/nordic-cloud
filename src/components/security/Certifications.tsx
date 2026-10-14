import { CERTIFICATIONS } from "@/content/certifications";

/**
 * Renders exactly the entries in src/content/certifications.ts, which ships empty. With no
 * entries it renders nothing at all: no heading, no gap, and never a generated badge.
 */
export function Certifications() {
  if (CERTIFICATIONS.length === 0) return null;
  return (
    <div className="mt-10" data-certifications="">
      <h3 className="font-mono text-xs tracking-wider text-ink-muted uppercase">Certifications</h3>
      <ul className="mt-4 flex flex-wrap gap-3">
        {CERTIFICATIONS.map((c) => {
          const inner = (
            <>
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- static export, issuer artwork
                <img src={c.image} alt="" className="h-8 w-auto" />
              ) : null}
              <span>
                <span className="block text-sm font-medium text-ink">{c.name}</span>
                <span className="block text-xs text-ink-muted">{c.issuer}</span>
              </span>
            </>
          );
          return (
            <li key={c.name}>
              {c.url ? (
                <a href={c.url} className="sec-cert">
                  {inner}
                </a>
              ) : (
                <span className="sec-cert">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
