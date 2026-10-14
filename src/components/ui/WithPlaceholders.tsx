import { Fragment } from "react";

const TOKEN = /(\{\{[A-Z_]+\}\})/;

const TITLES: Record<string, string> = {
  "{{CONFIRM}}": "Draft claim: needs legal or ops sign-off before launch",
};

/**
 * Renders copy with every unfilled {{PLACEHOLDER}} shown as a small mono chip, so drafts and
 * missing values are impossible to miss on the page. Plain text otherwise.
 */
export function WithPlaceholders({ text }: { text: string }) {
  return text.split(TOKEN).map((part, i) =>
    TOKEN.test(part) ? (
      <span
        key={i}
        className="placeholder-chip"
        data-placeholder={part.slice(2, -2)}
        title={TITLES[part] ?? "Placeholder: value not final"}
      >
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
