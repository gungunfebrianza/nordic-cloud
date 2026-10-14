/**
 * A two-option radio group drawn as a pill. Native radios, so arrow keys, Tab and screen readers
 * work as they should. The thumb slides with pure CSS keyed on the checked input (pricing.css).
 */
export function PillToggle({
  name,
  legend,
  options,
  checked,
}: {
  name: string;
  legend: string;
  /** Exactly two options; ids are pr-<name>-<value>, which pricing.css keys on. */
  options: readonly { value: string; label: string }[];
  checked: string;
}) {
  return (
    <fieldset className="pill-field">
      <legend className="sr-only">{legend}</legend>
      <div className="pill">
        {options.map((o) => {
          const id = `pr-${name}-${o.value.toLowerCase()}`;
          return [
            <input
              key={`${id}-input`}
              type="radio"
              className="pill-input"
              name={`pricing-${name}`}
              id={id}
              value={o.value}
              defaultChecked={o.value === checked}
            />,
            <label key={`${id}-label`} htmlFor={id} className="pill-option">
              {o.label}
            </label>,
          ];
        })}
        <span className="pill-thumb" aria-hidden="true" />
      </div>
    </fieldset>
  );
}
