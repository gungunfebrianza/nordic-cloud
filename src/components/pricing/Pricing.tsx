import { Check } from "lucide-react";
import { WithPlaceholders } from "@/components/ui/WithPlaceholders";
import type { Copy } from "@/content/copy-types";
import { DEFAULT_CURRENCY } from "@/content/i18n";
import { BILLINGS, CURRENCIES, PRICES, VATS, type Currency } from "@/content/pricing";
import { PRODUCT_IDS } from "@/content/products";
import { displayAmount, formatPrice, parsePrice } from "@/lib/pricing";
import { PillToggle } from "./PillToggle";
import { PricingMotion } from "./PricingMotion";

/**
 * Three tiers, three toggles. The toggles are real radio groups; which price and which notes show
 * is pure CSS keyed on the checked inputs (pricing.css), so it works without JS. Every variant is
 * server-rendered. A lazy chunk adds the count-up, only for prices that are real numbers.
 */
export function Pricing({ t }: { t: Copy }) {
  const p = t.pricing;
  const currency = DEFAULT_CURRENCY[t.locale];
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      data-section="pricing"
      data-intl={t.intl}
      className="pricing scroll-mt-16 border-b border-line"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">{p.eyebrow}</p>
        <h2
          id="pricing-heading"
          className="mt-3 max-w-[20ch] text-4xl leading-tight font-semibold text-ink sm:text-5xl"
        >
          {p.heading}
        </h2>
        <p className="mt-4 max-w-[52ch] text-lg text-ink-muted">{p.intro}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          <PillToggle
            name="billing"
            legend={p.billing}
            options={[
              { value: "monthly", label: p.monthly },
              { value: "annual", label: p.annual },
            ]}
            checked="monthly"
          />
          <PillToggle
            name="currency"
            legend={p.currency}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            checked={currency}
          />
          <PillToggle
            name="vat"
            legend={p.vat}
            options={[
              { value: "excl", label: p.vatExclOption },
              { value: "incl", label: p.vatInclOption },
            ]}
            checked="excl"
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRODUCT_IDS.map((id) => {
            const name = t.products.items[id].title;
            const tier = p.tiers[id];
            return (
              <article
                key={id}
                className="price-card"
                data-tier={id}
                data-featured={id === "vps" ? "" : undefined}
                aria-labelledby={`price-${id}-title`}
              >
                <h3 id={`price-${id}-title`} className="text-xl font-semibold text-ink">
                  {name}
                </h3>
                <p className="mt-1.5 text-[15px] text-ink-muted md:min-h-[2lh]">{tier.line}</p>

                <p className="price mt-6">
                  {BILLINGS.flatMap((b) =>
                    CURRENCIES.flatMap((c) =>
                      VATS.map((v) => (
                        <PriceValue
                          key={`${b}-${c}-${v}`}
                          constant={PRICES[id][b][c]}
                          billing={b}
                          currency={c}
                          vat={v}
                          t={t}
                        />
                      )),
                    ),
                  )}
                  <span className="price-unit">{p.perMonth}</span>
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  <span data-b="monthly">{p.billedMonthly}</span>
                  <span data-b="annual">{p.billedAnnually}</span>
                  {" · "}
                  <span data-v="excl">{p.vatExcl}</span>
                  <span data-v="incl">{p.vatIncl}</span>
                </p>

                <ul className="mt-6 space-y-2.5 text-[15px] text-ink">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check
                        size={16}
                        strokeWidth={1.75}
                        className="mt-[3px] shrink-0 text-signal"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                <a href="#cta" className="price-cta">
                  {p.cta}
                  <span className="sr-only">: {name}</span>
                </a>
              </article>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite" data-pricing-live={p.announce("{prices}")} />
      </div>
      <PricingMotion />
    </section>
  );
}

/**
 * One of the eight variants of a price (billing × currency × VAT). CSS shows the one matching the
 * toggles. The visual copy may count up (aria-hidden); the sr-only copy is always the final value.
 */
function PriceValue({
  constant,
  billing,
  currency,
  vat,
  t,
}: {
  constant: string;
  billing: (typeof BILLINGS)[number];
  currency: Currency;
  vat: (typeof VATS)[number];
  t: Copy;
}) {
  const base = parsePrice(constant);
  const n = base === null ? null : displayAmount(base, billing, vat === "incl");
  const text = n === null ? constant : formatPrice(n, currency, t.intl);
  return (
    <span
      className="price-v"
      data-b={billing}
      data-c={currency}
      data-v={vat}
      data-n={n ?? undefined}
    >
      <span className="price-anim" aria-hidden="true">
        <WithPlaceholders text={text} t={t.common} />
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
