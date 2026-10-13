/** Marks an illustrative figure from src/content/demo.ts on screen. */
export function DemoTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`rounded-[6px] border border-line px-1.5 font-mono text-[10px] tracking-wider text-ink-muted uppercase ${className}`}
      title="Illustrative figure, not live data"
    >
      demo
    </span>
  );
}
