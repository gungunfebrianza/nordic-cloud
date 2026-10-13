import { AGENT_FILE, AGENT_YAML } from "@/content/how";
import { highlightYaml } from "./yaml";

const TOK_CLASS = { c: "tok-c", k: "tok-k", s: "tok-s", p: "tok-p", v: "" } as const;

/** Step 1: the agent config in a mono code panel. The lazy controller types it out on desktop. */
export function CodePanel() {
  const lines = highlightYaml(AGENT_YAML);
  return (
    <div className="how-code">
      <div className="how-code-bar">
        <span className="font-medium text-ink">{AGENT_FILE}</span>
        <span>yaml</span>
      </div>
      <pre className="how-code-pre">
        <code>
          {lines.map((toks, i) => (
            <span key={i} className="how-code-line">
              {toks.map((tok, j) => (
                <span key={j} className={TOK_CLASS[tok.t] || undefined}>
                  {tok.text}
                </span>
              ))}
            </span>
          ))}
          <span className="how-caret" />
        </code>
      </pre>
    </div>
  );
}
