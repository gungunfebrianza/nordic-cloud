import type { Copy } from "@/content/copy-types";
import { PRODUCT_HREF, PRODUCT_IDS, PRODUCT_PRICE, type ProductId } from "@/content/products";
import { CompareTable } from "./CompareTable";
import { BotsDial } from "./diagrams/BotsDial";
import { ClusterRing } from "./diagrams/ClusterRing";
import { VpsBlock } from "./diagrams/VpsBlock";
import { ProductCard } from "./ProductCard";
import { ProductsMotion } from "./ProductsMotion";

const DIAGRAMS: Record<ProductId, () => React.ReactNode> = {
  bots: BotsDial,
  vps: VpsBlock,
  clusters: ClusterRing,
};

export function Products({ t }: { t: Copy }) {
  const p = t.products;
  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      data-section="products"
      className="scroll-mt-16 border-b border-line"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">{p.eyebrow}</p>
        <h2
          id="products-heading"
          className="mt-3 max-w-[20ch] text-4xl leading-tight font-semibold text-ink sm:text-5xl"
        >
          {p.heading}
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRODUCT_IDS.map((id) => {
            const Diagram = DIAGRAMS[id];
            return (
              <ProductCard
                key={id}
                id={id}
                product={p.items[id]}
                price={PRODUCT_PRICE[id]}
                href={PRODUCT_HREF[id]}
                t={p}
                diagram={<Diagram />}
              />
            );
          })}
        </div>
        <CompareTable
          label={p.compare}
          feature={p.compareFeature}
          titles={PRODUCT_IDS.map((id) => p.items[id].title)}
          rows={p.compareRows}
        />
      </div>
      <ProductsMotion />
    </section>
  );
}
