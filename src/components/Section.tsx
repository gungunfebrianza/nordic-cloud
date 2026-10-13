import type { ReactNode } from "react";
import type { SectionId } from "@/content/site";

/** Anchor wrapper. scroll-mt keeps headings clear of the 64px sticky nav. */
export function Section({
  id,
  label,
  children,
  className = "",
}: {
  id: SectionId;
  label: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      data-section={id}
      className={`scroll-mt-16 border-b border-line ${className}`}
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">{children}</div>
    </section>
  );
}
