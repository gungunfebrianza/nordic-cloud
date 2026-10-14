/**
 * #pricing non-copy. Every price is a placeholder until Haze sets it: one constant each, never
 * invented. DKK is its own price list, not a conversion of EUR.
 *
 * MONTHLY = the price per month when billed monthly.
 * ANNUAL  = the yearly total when billed annually; the page shows it as the monthly equivalent.
 * All prices exclude VAT; the VAT toggle adds Danish VAT (25%).
 */
import type { Billing, Currency } from "../lib/pricing";
import type { ProductId } from "./products";

export type { Billing, Currency } from "../lib/pricing";

export const PRICE_BOTS_MONTHLY_EUR = "{{PRICE_BOTS_MONTHLY_EUR}}";
export const PRICE_BOTS_ANNUAL_EUR = "{{PRICE_BOTS_ANNUAL_EUR}}";
export const PRICE_BOTS_MONTHLY_DKK = "{{PRICE_BOTS_MONTHLY_DKK}}";
export const PRICE_BOTS_ANNUAL_DKK = "{{PRICE_BOTS_ANNUAL_DKK}}";

export const PRICE_VPS_MONTHLY_EUR = "{{PRICE_VPS_MONTHLY_EUR}}";
export const PRICE_VPS_ANNUAL_EUR = "{{PRICE_VPS_ANNUAL_EUR}}";
export const PRICE_VPS_MONTHLY_DKK = "{{PRICE_VPS_MONTHLY_DKK}}";
export const PRICE_VPS_ANNUAL_DKK = "{{PRICE_VPS_ANNUAL_DKK}}";

export const PRICE_CLUSTERS_MONTHLY_EUR = "{{PRICE_CLUSTERS_MONTHLY_EUR}}";
export const PRICE_CLUSTERS_ANNUAL_EUR = "{{PRICE_CLUSTERS_ANNUAL_EUR}}";
export const PRICE_CLUSTERS_MONTHLY_DKK = "{{PRICE_CLUSTERS_MONTHLY_DKK}}";
export const PRICE_CLUSTERS_ANNUAL_DKK = "{{PRICE_CLUSTERS_ANNUAL_DKK}}";

export type Vat = "excl" | "incl";

export const BILLINGS: readonly Billing[] = ["monthly", "annual"];
export const CURRENCIES: readonly Currency[] = ["EUR", "DKK"];
export const VATS: readonly Vat[] = ["excl", "incl"];

/** Danish VAT (moms). */
export const VAT_RATE = 0.25;

/** A price constant: a number in a string, or a {{PLACEHOLDER}}. */
export const PRICES: Record<ProductId, Record<Billing, Record<Currency, string>>> = {
  bots: {
    monthly: { EUR: PRICE_BOTS_MONTHLY_EUR, DKK: PRICE_BOTS_MONTHLY_DKK },
    annual: { EUR: PRICE_BOTS_ANNUAL_EUR, DKK: PRICE_BOTS_ANNUAL_DKK },
  },
  vps: {
    monthly: { EUR: PRICE_VPS_MONTHLY_EUR, DKK: PRICE_VPS_MONTHLY_DKK },
    annual: { EUR: PRICE_VPS_ANNUAL_EUR, DKK: PRICE_VPS_ANNUAL_DKK },
  },
  clusters: {
    monthly: { EUR: PRICE_CLUSTERS_MONTHLY_EUR, DKK: PRICE_CLUSTERS_MONTHLY_DKK },
    annual: { EUR: PRICE_CLUSTERS_ANNUAL_EUR, DKK: PRICE_CLUSTERS_ANNUAL_DKK },
  },
};
