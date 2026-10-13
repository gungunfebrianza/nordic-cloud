import type { NavItem } from "@/content/site";

/**
 * Hover/focus underline: a 1px signal bar that scales in from the left over 200 ms.
 * Pure CSS, so it costs no JavaScript.
 */
export function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  return (
    <a
      href={item.href}
      onClick={onNavigate}
      className="group relative inline-flex h-9 items-center text-[15px] text-ink-muted transition-colors duration-(--duration-micro) ease-entrance hover:text-ink focus-visible:text-ink"
    >
      {item.label}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-signal transition-transform duration-(--duration-micro) ease-entrance group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
    </a>
  );
}
