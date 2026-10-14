# CLAUDE.md

Marketing landing page for **Serperku**. Static Next.js export, light theme only, hand-built components.

> The brand name is **Serperku** (set 2026-10-13; it was the placeholder `{{BRAND}}` before), held in **one**
> constant: `src/content/site.ts` → `export const BRAND = "Serperku"`. Every visible use reads that constant.
> Never hard-code the brand name anywhere else.

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
| `npm run measure:how` | #how controller chunk size (gzip) and frame rate while scrolling and looping (needs a build) |
| `npm run check` | Everything above except Lighthouse, in order |
| `npm run posters` | Regenerate the placeholder AVIF posters |

Sandboxes without Playwright's own browser: set `PLAYWRIGHT_CHROMIUM_PATH` (tests) and `CHROME_PATH` (Lighthouse).

---

## Brand brief (verbatim)

```
BRAND BRIEF — {{Serperku}}

COMPANY
{{Serperku}} is a Jakarta-Singapore-Copenhagen-based, EU-hosted cloud for always-on AI agents.
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

| Metric | Budget | Current (after #how, 2026-10-13; see "Sandbox noise") |
|---|---|---|
| Lighthouse mobile Performance | ≥ 90 | simulated 95 ✓ / devtools 90 (82–88 after #products) |
| Lighthouse Accessibility | ≥ 95 | 100 |
| Lighthouse Best Practices | ≥ 95 | 100 |
| Lighthouse SEO | ≥ 95 | 100 |
| LCP (throttled 4G, mobile) | < 2.0 s | devtools 1.89 s; Lantern estimate 2.0–2.9 s |
| CLS | < 0.05 | 0 |
| INP | < 200 ms | lab proxy TBT: devtools 348 ms ✗ (440–610 after #products; hero-only 283) |
| Initial JS, gzipped | ≤ 150 KB (lazy chunks excluded) | 139.4 KB (after #use-cases, 2026-10-14) |
| Hero canvas chunk, gzipped | (lazy; keep small) | 4.8 KB (includes precomputed graph) |
| Products motion chunk, gzipped | (lazy; keep small) | 5.1 KB |
| Use-cases typing chunk, gzipped | (lazy; keep small) | 0.9 KB |
| #how useScroll controller chunk, gzipped | (lazy, desktop only; keep small) | 6.9 KB (includes motion/react's useScroll) |

**Sandbox noise.** These runs happen in a cloud container with no GPU. Repeated Lighthouse runs on the
same build swing by ±100 ms TBT and ±0.4 s simulated LCP. Where the main thread goes (4× CPU trace):
React hydration ~300 ms, first style+layout ~150–250 ms, lazy chunk evaluation. #products added
~40 ms hydration and ~100 ms first render. Confirm on a real mid-range phone / PageSpeed Insights
before major surgery. **Decision (Haze, 2026-10-13):** keep building; optimise only if PageSpeed
Insights or a real phone fails the budget after deploy.

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
- **Below-the-fold motion** (pattern from #products): server-render the SVG, then a tiny client
  component waits for load + idle + near-viewport and `import()`s a chunk that animates with
  `animate` from `motion/mini` (WAAPI, ~5 KB) plus `inView`/`stagger` from `motion`. Use the
  individual CSS transform properties (`rotate`, `translate`, `scale`) in keyframes. The hover lift
  owns `translate` on cards, so entrances animate `transform` instead.
- **Scroll-linked motion** (pattern from #how): server-render every state; CSS transitions keyed on a
  `data-step` attribute do the morphs. A tiny client component `React.lazy()`-loads a controller near
  the viewport (desktop only) that uses `useScroll` from `motion/react` purely to *read* progress and
  set `data-step`. `motion/react` stays out of the initial bundle this way. Never use it to scroll.
- **Loops are CSS animations, paused by default** (`.how-loop`), and run only under
  `[data-running="true"]` set by an IntersectionObserver, so off-screen and hidden-tab cost is zero.
- **No module-level heavy work in lazy chunks.** The hero force layout is precomputed into
  `graph-data.ts` (`npm run gen:graph`); a test fails if it drifts from `buildGraph()`.
- **`content-visibility: auto` was tried and rejected**: estimated section heights make nav anchor
  jumps land in the wrong place.
- **Headroom is small.** Next.js + React alone are ~125 KB of the 150 KB. `motion` must be loaded as `LazyMotion` + `m` with `domAnimation` features, ideally lazily. Importing the full `motion` component on the first screen will break the budget.
- **Fonts**: `latin` subset only (covers Danish æ ø å). Only Space Grotesk and Inter are preloaded; JetBrains Mono is not (`preload: false`). Adding subsets or weights costs LCP.
- **Media**: every video has an AVIF poster; layout space comes from the poster's aspect ratio; videos are `preload="none"` and mounted near the viewport.
- The Lighthouse number assumes gzip/brotli at the host. `npm start` gzips to match.

---

## File conventions

```
src/app/                 shell.tsx (fonts, <html lang>, metadataFor(locale) with hreflang), globals.css,
                         icon.svg, global-not-found.tsx (one bilingual 404; experimental.globalNotFound)
src/app/(en)/            root layout lang="en" + page.tsx → /
src/app/(da)/            root layout lang="da" + da/page.tsx → /da/
src/components/Page.tsx  the whole page for one locale; section order; passes `t` (Copy) to each section
src/components/LanguageSwitch.tsx  "EN · DA" plain links (nav, mobile menu, footer); no cookie/storage
src/content/copy-types.ts  the Copy type: EVERY visible string. en.ts / da.ts each export one Copy
src/content/en.ts, da.ts  all copy. Danish strings are wrapped in review() until a native check
src/content/i18n.ts      COPY, LOCALES, localeHref(), languageLinks(), SITE_URL (NEXT_PUBLIC_SITE_URL)
src/styles/tokens.css    ALL design tokens (@theme). No raw hex anywhere else, except SVG/poster generators.
src/lib/motion-constants.ts  motion constants, no dependencies (safe for lazy/canvas code)
src/lib/motion.ts        re-exports the constants + useMotionVariants() (pulls in motion/react)
src/components/products/ Products, ProductCard, diagrams/* (server SVG), CompareTable + ProductsMotion
                         (client), products-motion.ts (lazy, motion/mini), products.css
src/components/how/      How, CodePanel, Scene, Dashboard, BrandFilm (server); HowScroll, BrandFilmPlayer
                         (client); how-scroll.tsx (lazy, useScroll); europe-data.ts (generated by
                         scripts/gen-europe.mjs from Natural Earth, public domain); how.css
src/components/use-cases/ UseCases, UseCaseTile (server); UseCasesMotion (client) lazy-loads
                         use-cases-motion.ts (typed jobs, carousel counter; no motion library); use-cases.css
src/components/pricing/  Pricing, PillToggle (server; variants shown by pure CSS on the checked radios);
                         PricingMotion (client) lazy-loads pricing-motion.ts (count-up, live region); pricing.css
src/components/faq/      Faq (server; button aria-expanded + region per question), FaqToggle (client, ~0.3 KB:
                         one delegated click listener); faq.css animates from aria-expanded. noscript = all open
src/components/media/    AgentVideo (server: build-time source check, poster-only when no file),
                         AgentVideoPlayer (client: 50% visible play/pause, Save-Data/reduced-motion play
                         button, poster on error), video-coordinator.ts (one film at a time under 768px)
src/components/security/ Security, ShieldScene (SVG), SecurityLog, StatusWidget, Certifications (server);
                         SecurityRunning (client, sets data-running); shield-geometry.ts; security.css.
                         All loops are CSS, synced on one 9.6 s timeline (packet catch = log step)
src/content/certifications.ts  Ships EMPTY. The row renders only its entries; never generate a badge
src/components/hero/     Hero (server), NetworkSnapshot (SVG, server), NetworkStage + AgentsOnlineChip
                         (client), hero-canvas.ts (lazy 2D canvas, no React), graph.ts (shared layout),
                         hero.css (imported from globals.css, so there is one render-blocking stylesheet)
src/content/site.ts      BRAND, DATACENTER_LOCATIONS, SECTION_IDS. Other content files hold non-copy only
                         (ids, hrefs, prices, placeholders, the agent.yaml sample).
src/content/demo.ts      EVERY demo/illustrative number, wrapped in demo(value, note) → { DEMO: true }
src/components/<area>/   Hand-built components, PascalCase.tsx, one component per file
src/components/ui/       Primitives (Button, …)
public/media/            Films + AVIF posters; see public/media/README.md
tests/                   Playwright: smoke.spec.ts (behaviour), screenshot.spec.ts (review images)
scripts/                 serve, budget, brand, lighthouse, posters
```

- **Server components by default.** Add `"use client"` only where state or effects are needed.
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
- **Measuring**: `npm run measure:hero` / `npm run measure:products` report lazy chunk size and frame rate.
- **Placeholders**: 12 prices live in `src/content/pricing.ts`, one constant each, like `BRAND`:
  `{{PRICE_<BOTS|VPS|CLUSTERS>_<MONTHLY|ANNUAL>_<EUR|DKK>}}`. MONTHLY = per month billed monthly;
  ANNUAL = the yearly total (shown ÷ 12 as "billed annually"). DKK is its own price, never converted.
  All exclude VAT; the toggle shows ×1.25, rounded once to whole units (`src/lib/pricing.ts`).
  #products "from" prices read the same constants (monthly, the page's default currency: EUR on /,
  DKK on /da/). The count-up switches on by itself once a constant is a real number.
  Compare-table rows (en.ts / da.ts) are placeholders for Haze to fill.
  `{{DATACENTER_LOCATIONS}}` (#how map label, #security residency block) lives in `src/content/site.ts`.
  `{{STATUS_URL}}` lives in `src/content/security.ts`; the status card is not a link until it is real.
  `{{SLA_PERCENT}}` and `{{LIMITS}}` (#faq answers) live in `src/content/faq.ts`.
- **Draft claims**: `{{CONFIRM}}` follows every #security claim that needs legal or ops sign-off.
  `WithPlaceholders` renders any `{{TOKEN}}` in copy as a visible chip; `check:brand` warns with the
  count. It must be zero before launch.
- **Brand film**: `BrandFilm.tsx` checks `public/media` at build time. Without `brand-film.{webm,mp4}`
  and `brand-film.en.vtt` it shows the poster and "Film coming soon"; with them, a click-to-play player.
- **Section anchors**: `#hero #products #how #use-cases #security #pricing #faq #cta`, defined in `SECTION_IDS`; the smoke test asserts the order.
- **i18n**: English at `/`, Danish at `/da/`, both static, each with its own root layout so `<html lang>`
  is right. Never hard-code a visible string in a component: add it to `Copy` (copy-types.ts), then to
  en.ts and da.ts (the build fails if Danish misses one). Server sections take `t: Copy`; client
  components get only the strings they need as props, so neither language's copy lands in client JS.
  Mono log lines, the agent.yaml sample and product names stay English in both. Danish drafts are
  wrapped in `review("…")`; `check:brand` warns with the count; unwrap a string once a native speaker
  approves it. `check:budget` measures both pages. Set `NEXT_PUBLIC_SITE_URL` at build for absolute
  canonical/hreflang URLs (default: the local preview server).

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
