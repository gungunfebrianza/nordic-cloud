# CLAUDE.md

Marketing landing page for **{{BRAND}}**. Static Next.js export, light theme only, hand-built components.

> The brand name is not final. It is the literal placeholder `{{BRAND}}`, held in **one** constant:
> `src/content/site.ts` → `export const BRAND = "{{BRAND}}"`. Every visible use reads that constant.
> Never hard-code or invent a brand name anywhere else.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Static export to `out/` |
| `npm start` | Serve `out/` locally (gzip on, like production) on :4173 |
| `npm run typecheck` / `lint` / `format:check` | TypeScript strict, ESLint (next core-web-vitals + TS), Prettier |
| `npm run check:brand` | Banned words, `text-pulse` misuse |
| `npm run check:budget` | Gzipped initial JS for `/` ≤ 150 KB (needs a build) |
| `npm test` | Playwright smoke + screenshot tests against `out/` (needs a build) |
| `npm run lighthouse` | Lighthouse mobile, simulated ×3 + devtools-throttled ×3, medians, fails under budget (needs a build) |
| `npm run measure:hero` | Hero canvas lazy chunk size (gzip) and frame rate in 3 scenarios (needs a build) |
| `npm run check` | Everything above except Lighthouse, in order |
| `npm run posters` | Regenerate the placeholder AVIF posters |

Sandboxes without Playwright's own browser: set `PLAYWRIGHT_CHROMIUM_PATH` (tests) and `CHROME_PATH` (Lighthouse).

---

## Brand brief (verbatim)

```
BRAND BRIEF — {{BRAND}}

COMPANY
{{BRAND}} is a Copenhagen-based, EU-hosted cloud for always-on AI agents.
Products:
  1. Always-on bots — single agents that run 24/7: scheduled, event-driven or webhook-triggered.
  2. Agent VPS — dedicated virtual servers pre-built for agent runtimes, GPU optional.
  3. Multi-agent clusters — orchestrated teams of agents with shared memory, queues and observability.
Verticals: Economy, Finance, Security, Banking, Programming, Blockchain.
Audience: CTOs, platform engineers, and risk/compliance leads at EU fintechs, banks, Web3 firms and software companies.

POSITIONING
Main line: "Agents that never clock out."
Alternates: "While Copenhagen sleeps, your agents ship." / "Always on. Even in a Danish winter."
Voice: precise, calm, confident. Nordic understatement. Short sentences.
Banned words: revolutionary, game-changing, unleash, supercharge, next-gen, magic.

VISUAL LANGUAGE — "Nordic futurism"
Bright daylight surfaces, ink-black type, electric signal colours, generous whitespace.
Thin 1px lines, 16–24px corner radii, soft frosted-glass panels on light backgrounds.
Systems and data shown as abstract, beautiful diagrams: nodes, links, packets, dials, ledgers.
Never: humanoid robots, glowing brains, circuit-board clichés, stock photos of people at screens,
real company or coin logos, dark-mode-by-default.

COLOUR TOKENS (light theme only in v1)
  paper      #F6F8FC   page background
  surface    #FFFFFF   cards, panels
  ink        #0A1020   primary text
  ink-muted  #5A6478   secondary text
  line       #E3E8F2   hairlines, borders, idle links
  signal     #2962FF   primary actions, links, main agent colour (AA on white)
  pulse      #00C8FF   activity, packets, live data — graphics only, never body text
  aurora     #7B5CFF   multi-agent coordination, accents
  live       #10C98A   online, healthy, success
  alert      #FF4B3E   threats, anomalies — sparingly
  Gradient "aurora": linear 120deg, #00C8FF -> #2962FF -> #7B5CFF.
  Rule: the aurora gradient appears on at most 1–2 elements per screen.

TYPE
  Display: Space Grotesk 600/700, tracking -0.02em
  Body: Inter 400/500
  Mono (logs, metrics, labels, code): JetBrains Mono 400/500

MOTION LANGUAGE — "the heartbeat"
  Core motif: a pulse. A ring expands from a node and fades every 2.4 s (HEARTBEAT = 2400 ms).
  Anything "always on" ticks to this rhythm, with per-element phase offsets so scenes shimmer, not blink.
  Packets: small glowing pulse-coloured dots travel along thin links, 0.8–1.6 s per hop.
  Easing: cubic-bezier(0.22, 1, 0.36, 1) for entrances; linear for ambient loops;
          spring (stiffness 300, damping 30) for UI micro-interactions.
  Durations: micro-interactions 150–250 ms; entrances 600–900 ms with 60–80 ms stagger;
             ambient loops are whole multiples of 2.4 s and always seamless.
  Rule: every motion explains something (data flow, uptime, coordination, protection).
        Nothing spins for decoration.
```

---

## Motion rules

Source of truth: `src/lib/motion.ts` (JS, for `motion/react`) and the motion tokens in `src/styles/tokens.css` (CSS). Keep them in sync.

1. **Every motion explains something**: data flow, uptime, coordination or protection. Nothing spins for decoration. If you can't say what a motion explains, delete it.
2. **The heartbeat.** `HEARTBEAT_MS = 2400`. Anything "always on" ticks to it. Use `heartbeatPhase(i)` (JS) or the `heartbeat-phase` utility with `--phase` (CSS) so elements shimmer instead of blinking in unison.
3. **Ambient loops** last a whole number of heartbeats (`heartbeats(n)` throws otherwise), use linear easing and must loop seamlessly.
4. **Packets** travel 0.8–1.6 s per hop (`packetHopDuration(lengthPx)`), pulse-coloured, along 1px links.
5. **Entrances**: 600–900 ms (`DURATION.entrance` = 750 ms), `EASE.entrance` = `cubic-bezier(0.22, 1, 0.36, 1)`, 60–80 ms stagger (`STAGGER.default` = 70 ms).
6. **Micro-interactions**: 150–250 ms (`--duration-micro` = 200 ms) in CSS, or `SPRING` (stiffness 300, damping 30) in motion.
7. **Reduced motion is mandatory.** Components take variants from `useMotionVariants()`, never ad-hoc. With `prefers-reduced-motion: reduce`, entrances are opacity-only and instant, and ambient loops stop. Global CSS also neutralises CSS animations.
8. **Prefer CSS** for hover/focus/scroll states (e.g. the nav underline and scroll border). Reach for `motion/react` only when CSS can't express it, and load it with `LazyMotion` + `m` (see the budget note below).
9. **No scroll-jacking.** Native scrolling only; `scroll-behavior: smooth` for anchors, off under reduced motion.

---

## Performance budget

Enforced by `npm run check:budget`, `npm run lighthouse` and the Playwright suite.

| Metric | Budget | Current (after #hero, 2026-10-13) |
|---|---|---|
| Lighthouse mobile Performance | ≥ 90 | 96 (simulated) / 96 (devtools) |
| Lighthouse Accessibility | ≥ 95 | 100 |
| Lighthouse Best Practices | ≥ 95 | 100 |
| Lighthouse SEO | ≥ 95 | 100 |
| LCP (throttled 4G, mobile) | < 2.0 s | 1.65 s measured (devtools); 2.64 s Lantern estimate, see below |
| CLS | < 0.05 | 0 |
| INP | < 200 ms | lab proxy: TBT 128–187 ms |
| Initial JS, gzipped | ≤ 150 KB (lazy hero canvas excluded) | 136.5 KB |
| Hero canvas chunk, gzipped | (excluded; keep small) | 3.7 KB |

**How LCP is measured.** `npm run lighthouse` runs both throttling modes. *devtools* really throttles
(150 ms RTT, 1.6 Mbps, 4× CPU) and observes; it gates LCP/CLS/TBT. *simulated* (Lantern, what
PageSpeed Insights shows) estimates from an unthrottled load and gates the category scores. On this
site Lantern's LCP estimate is ~2.6 s even for the bare scaffold, because on localhost first paint
happens after every script has downloaded, so Lantern puts all ~137 KB of framework JS on the LCP
path. The script prints a warning when the estimate is over 2.0 s. Bringing the estimate down means
shipping less framework JS before first paint. (The scaffold's earlier "LCP 1.86 s" was a single
simulated run that did not reproduce.)

- **Nothing heavy in the critical path**: no video, no WebGL, no 3D library before first paint. The hero canvas is a lazily imported module whose chunk name contains `hero-canvas` (that is what the budget script excludes).
- **Hero LCP element.** The H1 words rise individually (transform only, opacity 1 from frame one), which
  makes each word its own LCP candidate, so Chrome reports the sub-paragraph as LCP. It paints in the
  same first frame, so LCP time is unaffected. Never fade hero text in from opacity 0.
- **Headroom is small.** Next.js + React alone are ~125 KB of the 150 KB. `motion` must be loaded as `LazyMotion` + `m` with `domAnimation` features, ideally lazily. Importing the full `motion` component on the first screen will break the budget.
- **Fonts**: `latin` subset only (covers Danish æ ø å). Only Space Grotesk and Inter are preloaded; JetBrains Mono is not (`preload: false`). Adding subsets or weights costs LCP.
- **Media**: every video has an AVIF poster; layout space comes from the poster's aspect ratio; videos are `preload="none"` and mounted near the viewport.
- The Lighthouse number assumes gzip/brotli at the host. `npm start` gzips to match.

---

## File conventions

```
src/app/                 layout.tsx (fonts, metadata), page.tsx (section order), globals.css, icon.svg
src/styles/tokens.css    ALL design tokens (@theme). No raw hex anywhere else, except SVG/poster generators.
src/lib/motion-constants.ts  motion constants, no dependencies (safe for lazy/canvas code)
src/lib/motion.ts        re-exports the constants + useMotionVariants() (pulls in motion/react)
src/components/hero/     Hero (server), NetworkSnapshot (SVG, server), NetworkStage + AgentsOnlineChip
                         (client), hero-canvas.ts (lazy 2D canvas, no React), graph.ts (shared layout),
                         hero.css (imported from globals.css, so there is one render-blocking stylesheet)
src/content/site.ts      BRAND, tagline, nav items, section ids. All copy lives in src/content/.
src/content/demo.ts      EVERY demo/illustrative number, wrapped in demo(value, note) → { DEMO: true }
src/components/<area>/   Hand-built components, PascalCase.tsx, one component per file
src/components/ui/       Primitives (Button, …)
public/media/            Films + AVIF posters; see public/media/README.md
tests/                   Playwright: smoke.spec.ts (behaviour), screenshot.spec.ts (review images)
scripts/                 serve, budget, brand, lighthouse, posters
```

- **Server components by default.** Add `"use client"` only where state or effects are needed (currently: `Nav`).
- **Tailwind utilities from tokens**: `bg-paper`, `text-ink`, `text-ink-muted`, `border-line`, `bg-signal`, `font-display`, `font-mono`, `tracking-display`, `rounded-card`, `ease-entrance`, `duration-(--duration-micro)`, `bg-aurora`, `animate-heartbeat`. Tailwind's default palette is removed; only brand colours exist.
- **`pulse` is graphics-only**: `fill-pulse`, `stroke-pulse`, `bg-pulse` on shapes. Never `text-pulse` (`check:brand` fails on it).
- **Aurora gradient** (`bg-aurora`): at most 1–2 elements per screen.
- **Icons**: `lucide-react`, imported per icon, `aria-hidden` when decorative.
- **No UI kit** that imposes its own look.
- **Copy**: short sentences, calm, precise. No banned words (`check:brand` enforces it).
- **Accessibility**: one `h1`, sections are labelled landmarks, visible focus ring (`signal`), skip link, `aria-expanded` on toggles.
- **Pinned versions** (`.npmrc save-exact`). TypeScript is on 6.0.3, not 7.x: typescript-eslint does not support TS 7 yet. Revisit when it does.
- **Reduced-motion exceptions**: the global reduced-motion rule stops all CSS animation. Mark the rare
  motion the brief keeps (the hero core-node pulse) with `data-rm-ok`.
- **Canvas code** reads colours from the CSS tokens at mount (`getComputedStyle`), not hard-coded hex.
- **Measuring the hero**: `npm run measure:hero` reports the lazy chunk size and frame rate.
- **Section anchors**: `#hero #products #how #use-cases #security #pricing #faq #cta`, defined in `SECTIONS`; the smoke test asserts the order.

---

## NEVER

- Humanoid robots, glowing brains, circuit-board clichés, stock photos of people at screens.
- Real company or coin logos; **fake customer logos**.
- **Dark mode by default.** (Light theme only in v1; `color-scheme: light`.)
- **Placeholder compliance badges** (no fake ISO/SOC/GDPR seals).
- **Invented metrics shown as real.** Every demo number lives in `src/content/demo.ts`, marked `DEMO`, and is labelled as demo in the UI.
- **Autoplaying audio.**
- **Scroll-jacking.**
- Banned words: revolutionary, game-changing, unleash, supercharge, next-gen, magic.
- Requests to third-party origins from the page (fonts included). The smoke test fails on any.
- Video, WebGL or 3D libraries in the critical path.
- Decorative spinning or motion that doesn't explain something.
