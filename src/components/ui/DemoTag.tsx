/** Marks an illustrative figure from src/content/demo.ts. Never shown next to real data. */
export function DemoTag({ className = "" }: { className?: string }) {
  return (
    <span
      title="Illustrative figure, not live data"
      className={`rounded-[6px] border border-line px-1.5 font-mono text-[10px] tracking-wider text-ink-muted uppercase ${className}`}
    >
      demo
    </span>
  );
}
