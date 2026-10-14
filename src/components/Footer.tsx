import { PlaceholderLink } from "@/components/ui/PlaceholderLink";
import { WithPlaceholders } from "@/components/ui/WithPlaceholders";
import type { Copy } from "@/content/copy-types";
import { ADDRESS, COOKIES_URL, CVR, DPA_URL, EMAIL, PRIVACY_URL, TERMS_URL } from "@/content/legal";
import { STATUS_URL, isPlaceholder } from "@/content/security";
import { BRAND } from "@/content/site";
import { LanguageSwitch, type LanguageLink } from "./LanguageSwitch";

/**
 * On every page. Company name, address, CVR and email stay plainly visible (Danish e-commerce
 * rules). Legal links render as text with a chip while their URL is a placeholder.
 */
export function Footer({ t, languages }: { t: Copy; languages: LanguageLink[] }) {
  const f = t.footer;
  const links = [
    [f.links.privacy, PRIVACY_URL],
    [f.links.cookies, COOKIES_URL],
    [f.links.terms, TERMS_URL],
    [f.links.dpa, DPA_URL],
    [f.links.status, STATUS_URL],
    [f.links.security, "#security"],
  ] as const;
  return (
    <footer className="bg-paper">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-12 text-sm text-ink-muted sm:px-8 md:grid-cols-[minmax(16rem,1fr)_auto]">
        <address aria-label={f.company} className="not-italic">
          <p className="font-display text-base font-semibold tracking-display text-ink">{BRAND}</p>
          <p className="mt-2">
            <WithPlaceholders text={ADDRESS} t={t.common} />
          </p>
          <p className="mt-1">
            {f.cvr} <WithPlaceholders text={CVR} t={t.common} />
          </p>
          <p className="mt-1">
            {isPlaceholder(EMAIL) ? (
              <WithPlaceholders text={EMAIL} t={t.common} />
            ) : (
              <a href={`mailto:${EMAIL}`} className="text-ink underline underline-offset-2">
                {EMAIL}
              </a>
            )}
          </p>
        </address>

        <div className="flex flex-col gap-4 md:items-end">
          <ul aria-label={f.legal} className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map(([label, href]) => (
              <li key={label}>
                <PlaceholderLink
                  href={href}
                  label={label}
                  t={t.common}
                  className="text-ink-muted hover:text-ink"
                />
              </li>
            ))}
          </ul>
          <LanguageSwitch current={t.locale} label={t.common.languageLabel} links={languages} />
          <p className="font-mono text-xs">
            © {new Date().getFullYear()} {BRAND}
          </p>
        </div>
      </div>
    </footer>
  );
}
