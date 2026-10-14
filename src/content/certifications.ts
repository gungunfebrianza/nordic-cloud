/**
 * Certifications and attestations shown in #security. Ships EMPTY on purpose.
 *
 * Add an entry only once the certificate or report actually exists. The row renders exactly these
 * entries and nothing else: never a generated or placeholder badge. `image` must be the issuer's
 * own artwork, supplied with the certificate, under public/.
 */
export type Certification = {
  name: string;
  issuer: string;
  /** Public page where the certificate or report can be checked. */
  url?: string;
  /** Path under public/, e.g. "/certs/iso-27001.svg". Only the issuer's own artwork. */
  image?: string;
};

export const CERTIFICATIONS: readonly Certification[] = [];
