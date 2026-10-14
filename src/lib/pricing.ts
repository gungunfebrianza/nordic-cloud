/**
 * Price maths, shared by the server render and the count-up chunk. No dependencies.
 */
export type Billing = "monthly" | "annual";
export type Currency = "EUR" | "DKK";

export const VAT_FACTOR = 1.25;

/** The number in a price constant, or null while it is a {{PLACEHOLDER}} (or not a number). */
export function parsePrice(constant: string): number | null {
  if (!/^\s*\d+(\.\d+)?\s*$/.test(constant)) return null;
  return Number(constant);
}

/**
 * What the page shows per month: the monthly price, or the annual total ÷ 12; times 1.25 with
 * VAT. Rounded once, at the end, to whole units.
 */
export function displayAmount(base: number, billing: Billing, vat: boolean): number {
  const perMonth = billing === "annual" ? base / 12 : base;
  return Math.round(vat ? perMonth * VAT_FACTOR : perMonth);
}

/** Whole-unit currency format in the page's language: en-GB "€49", da-DK "365 kr.". */
export function formatPrice(n: number, currency: Currency, intl: string): string {
  return new Intl.NumberFormat(intl, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}
