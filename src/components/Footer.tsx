import { BRAND } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-12 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-base font-semibold tracking-display text-ink">{BRAND}</p>
        <p>Copenhagen, Denmark · EU-hosted</p>
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {BRAND}
        </p>
      </div>
    </footer>
  );
}
