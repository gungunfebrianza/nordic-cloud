import { PlaceholderLink } from "@/components/ui/PlaceholderLink";
import { WithPlaceholders } from "@/components/ui/WithPlaceholders";
import type { Copy } from "@/content/copy-types";
import { PRIVACY_URL } from "@/content/legal";
import { CONFIRM } from "@/content/security";
import { SIGNUP_ENDPOINT } from "@/lib/signup";
import { CtaForm } from "./CtaForm";

/**
 * The closing ask. The page's only full-bleed aurora gradient, with the headline and form on a
 * frosted white panel so every word stays ink on near-white (AA).
 */
export function Cta({ t }: { t: Copy }) {
  const c = t.cta;
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      data-section="cta"
      className="cta scroll-mt-16 bg-aurora"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8">
        <div className="cta-panel">
          <h2
            id="cta-heading"
            className="max-w-[18ch] text-4xl leading-tight font-semibold text-ink sm:text-5xl"
          >
            {c.heading}
          </h2>
          <p className="mt-4 max-w-[48ch] text-lg text-ink-muted">{c.sub}</p>
          <CtaForm
            locale={t.locale}
            endpoint={SIGNUP_ENDPOINT}
            s={{
              emailLabel: c.emailLabel,
              emailPlaceholder: c.emailPlaceholder,
              submit: c.submit,
              sending: c.sending,
              invalid: c.invalid,
              failed: c.failed,
              success: c.success,
            }}
          >
            {c.privacyNote}{" "}
            <PlaceholderLink
              href={PRIVACY_URL}
              label={c.privacyLink}
              t={t.common}
              className="font-medium text-ink underline underline-offset-2"
            />{" "}
            <WithPlaceholders text={CONFIRM} t={t.common} />
          </CtaForm>
        </div>
      </div>
    </section>
  );
}
