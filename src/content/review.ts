/**
 * Marks a Danish string that still needs a native speaker's review. Returns it unchanged; it
 * exists so the drafts are greppable. `npm run check:brand` counts the remaining calls and warns.
 * Once a string is approved, unwrap it.
 */
export const review = (s: string): string => s;
