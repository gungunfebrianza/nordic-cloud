import type { Locale } from "@/content/copy-types";

/** Plain data, built on the server by languageLinks() in i18n.ts. No copy is imported here. */
export type LanguageLink = { locale: Locale; href: string; label: string; name: string };

/**
 * "EN · DA": plain links to each language's page. No cookie, no storage, no redirect.
 * The current language is marked with aria-current; each link names its language in that language.
 */
export function LanguageSwitch({
  current,
  label,
  links,
  className = "",
  onNavigate,
}: {
  current: Locale;
  label: string;
  links: LanguageLink[];
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <ul aria-label={label} className={`lang-switch ${className}`}>
      {links.map((l, i) => (
        <li key={l.locale}>
          {i > 0 && (
            <span aria-hidden="true" className="lang-sep">
              ·
            </span>
          )}
          <a
            href={l.href}
            hrefLang={l.locale}
            lang={l.locale}
            aria-current={l.locale === current ? "page" : undefined}
            onClick={onNavigate}
            className="lang-link"
          >
            {l.label}
            <span className="sr-only"> ({l.name})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
