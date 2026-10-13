/** A tiny YAML highlighter for the config panel: enough for the fixed example, nothing more. */
export type Tok = { t: "c" | "k" | "s" | "p" | "v"; text: string };

export function highlightYaml(src: string): Tok[][] {
  return src.split("\n").map((line) => {
    const out: Tok[] = [];
    const comment = line.match(/^(\s*)(#.*)$/);
    if (comment)
      return [
        { t: "v", text: comment[1]! },
        { t: "c", text: comment[2]! },
      ];
    const m = line.match(/^(\s*)(- )?(?:([\w.]+)(:))?(.*)$/)!;
    const [, indent, dash, key, colon, rest] = m;
    if (indent) out.push({ t: "v", text: indent });
    if (dash) out.push({ t: "p", text: dash });
    if (key) out.push({ t: "k", text: key }, { t: "p", text: colon! });
    if (rest) {
      const s = rest.match(/^(\s*)(".*")$/);
      if (s) out.push({ t: "v", text: s[1]! }, { t: "s", text: s[2]! });
      else out.push({ t: "v", text: rest });
    }
    return out.filter((tok) => tok.text);
  });
}
