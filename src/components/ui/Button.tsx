import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-(--duration-micro) ease-entrance " +
  "active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-signal text-surface shadow-[0_1px_0_rgb(10_16_32/0.06),0_6px_16px_-6px_rgb(41_98_255/0.55)] " +
    "hover:bg-[#1f54e8] hover:shadow-[0_1px_0_rgb(10_16_32/0.06),0_10px_22px_-8px_rgb(41_98_255/0.6)]",
  ghost: "border border-line bg-surface/40 text-ink hover:border-ink/25 hover:bg-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </a>
  );
}
