"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

/** "Compare plans": expands a table with a height + fade transition (300 ms). */
export function CompareTable({
  label,
  feature,
  titles,
  rows,
}: {
  label: string;
  feature: string;
  /** Product titles, in column order. */
  titles: readonly string[];
  rows: readonly { label: string; cells: readonly string[] }[];
}) {
  const [open, setOpen] = useState(false);
  const regionId = useId();
  return (
    <div className="mt-12">
      <div className="flex justify-center">
        <button
          type="button"
          className="compare-toggle"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
        >
          {label}
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="compare-chevron"
          />
        </button>
      </div>
      <div id={regionId} className="compare-panel" data-open={open} inert={!open}>
        <div className="compare-inner">
          <div className="mt-6 overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">{label}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th
                    scope="col"
                    className="px-5 py-4 font-mono text-xs font-medium tracking-wider text-ink-muted uppercase"
                  >
                    {feature}
                  </th>
                  {titles.map((title) => (
                    <th
                      key={title}
                      scope="col"
                      className="px-5 py-4 font-display text-[15px] font-semibold text-ink"
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-0">
                    <th scope="row" className="px-5 py-3.5 font-normal text-ink-muted">
                      {row.label}
                    </th>
                    {row.cells.map((c, i) => (
                      <td key={i} className="px-5 py-3.5 text-ink">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
