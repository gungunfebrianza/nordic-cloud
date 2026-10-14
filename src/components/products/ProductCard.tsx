import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { Copy } from "@/content/copy-types";
import type { ProductId } from "@/content/products";
import { WithPlaceholders } from "@/components/ui/WithPlaceholders";

/**
 * One product card. The "Explore" link stretches over the whole card (::after), so the card has a
 * single tab stop and focusing it looks exactly like hovering (:focus-within in products.css).
 */
export function ProductCard({
  id,
  product,
  price,
  href,
  t,
  common,
  diagram,
}: {
  id: ProductId;
  product: Copy["products"]["items"][ProductId];
  price: string;
  href: string;
  t: Copy["products"];
  common: Copy["common"];
  diagram: ReactNode;
}) {
  const titleId = `product-${id}-title`;
  return (
    <article className="product-card" data-product={id} aria-labelledby={titleId}>
      <div className="product-diagram" data-diagram={id}>
        <div className="aspect-[16/9] w-full">{diagram}</div>
        <p className="mt-1 text-center font-mono text-[11px] tracking-wide text-ink-muted">
          {product.caption}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-5">
        <h3 id={titleId} className="text-xl font-semibold text-ink">
          {product.title}
        </h3>
        <p className="mt-1.5 text-[15px] text-ink-muted">{product.line}</p>
        <ul className="mt-5 space-y-2.5 text-[15px] text-ink">
          {product.bullets.map((b) => (
            <li key={b} className="flex gap-2.5">
              <Check
                size={16}
                strokeWidth={1.75}
                className="mt-[3px] shrink-0 text-signal"
                aria-hidden="true"
              />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-7">
          <p className="text-sm whitespace-nowrap text-ink-muted">
            {t.from}{" "}
            <span className="font-mono text-base font-medium text-ink">
              <WithPlaceholders text={price} t={common} />
            </span>
            {t.perMonth}
          </p>
          <a href={href} className="product-explore">
            {t.explore}
            <span className="sr-only"> {product.title}</span>{" "}
            <span className="product-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
