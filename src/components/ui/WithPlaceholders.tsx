import { Fragment } from "react";
import type { Copy } from "@/content/copy-types";

const TOKEN = /(\{\{[A-Z_]+\}\})/;

/**
 * Renders copy with every unfilled {{PLACEHOLDER}} shown as a small mono chip, so drafts and
 * missing values are impossible to miss on the page. Plain text otherwise. Tooltips come from copy.
 */
export function WithPlaceholders({ text, t }: { text: string; t: Copy["common"] }) {
  return text.split(TOKEN).map((part, i) =>
    TOKEN.test(part) ? (
      <span
        key={i}
        className="placeholder-chip"
        data-placeholder={part.slice(2, -2)}
        title={part === "{{CONFIRM}}" ? t.confirmTitle : t.placeholderTitle}
      >
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
