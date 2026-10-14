"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { Copy, Locale } from "@/content/copy-types";
import { BRAND } from "@/content/site";
import { LanguageSwitch, type LanguageLink } from "@/components/LanguageSwitch";
import { ButtonLink } from "@/components/ui/Button";
import { NavLink } from "./NavLink";

/** Scroll distance after which the nav gains its hairline border and blur. */
export const NAV_SCROLL_THRESHOLD_PX = 24;

export function Nav({
  locale,
  t,
  languageLabel,
  languages,
}: {
  locale: Locale;
  t: Copy["nav"];
  languageLabel: string;
  languages: LanguageLink[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > NAV_SCROLL_THRESHOLD_PX);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const elevated = scrolled || open;

  return (
    <header
      data-scrolled={scrolled}
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-(--duration-micro) ease-entrance ${
        elevated
          ? "border-line bg-paper/70 backdrop-blur-md backdrop-saturate-150"
          : "backdrop-blur-0 border-transparent bg-paper/40"
      }`}
    >
      <nav
        aria-label={t.label}
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8"
      >
        <a
          href="#hero"
          className="font-display text-lg font-semibold tracking-display text-ink"
          aria-label={`${BRAND} ${t.home}`}
        >
          {BRAND}
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {t.items.map((item) => (
            <li key={item.label}>
              <NavLink item={item} />
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitch
            current={locale}
            label={languageLabel}
            links={languages}
            className="mr-2"
          />
          <ButtonLink href={"#cta"} variant="ghost" size="sm">
            {t.talk}
          </ButtonLink>
          <ButtonLink href={"#cta"} variant="primary" size="sm">
            {t.deploy}
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-pill border border-line bg-surface/60 text-ink md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? t.closeMenu : t.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </nav>

      <div id={menuId} hidden={!open} className="border-t border-line md:hidden">
        <ul className="mx-auto flex max-w-[1200px] flex-col gap-1 px-5 py-4">
          {t.items.map((item) => (
            <li key={item.label}>
              <NavLink item={item} onNavigate={() => setOpen(false)} />
            </li>
          ))}
        </ul>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-5 pb-5">
          <ButtonLink href={"#cta"} variant="ghost" size="sm" onClick={() => setOpen(false)}>
            {t.talk}
          </ButtonLink>
          <ButtonLink href={"#cta"} variant="primary" size="sm" onClick={() => setOpen(false)}>
            {t.deploy}
          </ButtonLink>
          <LanguageSwitch
            current={locale}
            label={languageLabel}
            links={languages}
            className="ml-auto"
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
