"use client";

import { useEffect } from "react";

/**
 * Renders nothing. One delegated click listener on #faq flips aria-expanded on the question;
 * faq.css animates the answer from that attribute. Several answers can be open at once.
 */
export function FaqToggle() {
  useEffect(() => {
    const section = document.getElementById("faq");
    if (!section) return;
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element).closest<HTMLButtonElement>(".faq-q");
      if (!button) return;
      button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
    };
    section.addEventListener("click", onClick);
    return () => section.removeEventListener("click", onClick);
  }, []);
  return null;
}
