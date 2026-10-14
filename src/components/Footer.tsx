import type { Copy } from "@/content/copy-types";
import { BRAND } from "@/content/site";
import { LanguageSwitch, type LanguageLink } from "./LanguageSwitch";

export function Footer({ t, languages }: { t: Copy; languages: LanguageLink[] }) {
  return (
    <footer className="bg-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-12 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-base font-semibold tracking-display text-ink">{BRAND}</p>
        <p>{t.footer.location}</p>
        <LanguageSwitch current={t.locale} label={t.common.languageLabel} links={languages} />
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {BRAND}
        </p>
      </div>
    </footer>
  );
}
