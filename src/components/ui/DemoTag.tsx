/** Marks an illustrative figure from src/content/demo.ts on screen. Text and tooltip come from copy. */
export function DemoTag({
  label,
  title,
  className = "",
}: {
  label: string;
  title: string;
  className?: string;
}) {
  return (
    <span
      className={`rounded-[6px] border border-line px-1.5 font-mono text-[10px] tracking-wider text-ink-muted uppercase ${className}`}
      title={title}
    >
      {label}
    </span>
  );
}
