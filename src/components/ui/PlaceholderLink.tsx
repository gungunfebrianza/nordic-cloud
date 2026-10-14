import type { Copy } from "@/content/copy-types";
import { isPlaceholder } from "@/content/security";
import { WithPlaceholders } from "./WithPlaceholders";

/**
 * A link whose URL may still be a {{PLACEHOLDER}}. Until it is real it renders the label plus the
 * placeholder chip as plain text: never an anchor to "{{…}}", which would be a broken link.
 */
export function PlaceholderLink({
  href,
  label,
  t,
  className = "",
}: {
  href: string;
  label: string;
  t: Copy["common"];
  className?: string;
}) {
  if (isPlaceholder(href))
    return (
      <span className={className} data-placeholder-link="">
        {label} <WithPlaceholders text={href} t={t} />
      </span>
    );
  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}
