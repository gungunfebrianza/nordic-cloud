"use client";

import { Check } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

type State = "idle" | "sending" | "invalid" | "failed" | "done";

/**
 * Email + button. Native type=email + required decide validity; errors show inline, in the page's
 * language. The button is disabled while sending. On success it morphs into a check (width and
 * label crossfade, 250 ms spring) with one heartbeat ring, and stays.
 *
 * The endpoint is read from data-endpoint at submit time (baked at build). Empty: no request.
 */
export function CtaForm({
  locale,
  endpoint,
  s,
  children,
}: {
  locale: string;
  endpoint: string;
  s: {
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    sending: string;
    invalid: string;
    failed: string;
    success: string;
  };
  /** The note under the field (privacy line). */
  children: ReactNode;
}) {
  const [state, setState] = useState<State>("idle");
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const errorId = `${id}-error`;
  const noteId = `${id}-note`;

  const succeed = () => {
    // Pin the current width so it can transition down to a circle.
    const b = button.current;
    if (b) {
      b.style.width = `${b.offsetWidth}px`;
      requestAnimationFrame(() => {
        b.style.width = `${b.offsetHeight}px`;
        setState("done");
      });
    } else setState("done");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending" || state === "done") return;
    const form = e.currentTarget;
    const input = form.elements.namedItem("email") as HTMLInputElement;
    if (!input.checkValidity()) {
      setState("invalid");
      input.focus();
      return;
    }
    const url = form.dataset.endpoint;
    if (!url) return succeed();
    setState("sending");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: input.value, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      succeed();
    } catch {
      setState("failed");
    }
  };

  const error = state === "invalid" ? s.invalid : state === "failed" ? s.failed : "";

  return (
    <form
      className="cta-form mt-8"
      noValidate
      data-endpoint={endpoint}
      data-state={state}
      onSubmit={onSubmit}
    >
      <label htmlFor={`${id}-email`} className="block text-sm font-medium text-ink">
        {s.emailLabel}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={s.emailPlaceholder}
          className="cta-input"
          aria-invalid={state === "invalid" || undefined}
          aria-describedby={`${errorId} ${noteId}`}
          readOnly={state === "done"}
          onInput={() => (state === "invalid" || state === "failed") && setState("idle")}
        />
        <button
          ref={button}
          type="submit"
          className="cta-button"
          disabled={state === "sending" || state === "done"}
        >
          <span className="cta-label">{state === "sending" ? s.sending : s.submit}</span>
          <span className="cta-check" aria-hidden="true">
            <Check size={20} strokeWidth={2.25} />
          </span>
          <span className="cta-ring" aria-hidden="true" />
        </button>
      </div>
      <p id={errorId} className="cta-error" role="alert">
        {error}
      </p>
      <p role="status" className="sr-only">
        {state === "done" ? s.success : ""}
      </p>
      <p id={noteId} className="mt-1 text-sm text-ink-muted">
        {children}
      </p>
    </form>
  );
}
