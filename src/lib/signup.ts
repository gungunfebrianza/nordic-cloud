/**
 * Where the #cta form posts { email, locale } as JSON. Baked in at build from
 * NEXT_PUBLIC_SIGNUP_ENDPOINT. Empty means no request is made (the success state still shows),
 * and next.config.ts prints a warning at build that sign-ups go nowhere.
 */
export const SIGNUP_ENDPOINT = process.env.NEXT_PUBLIC_SIGNUP_ENDPOINT ?? "";
