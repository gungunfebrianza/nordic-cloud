# {{BRAND}} landing page scaffold: plan

Status: **approved and implemented** (2026-10-13). See CLAUDE.md for the live rules and numbers.

## Where it lives
- Project root: `/mnt/project-files/nordic-futures-site/` (no GitHub repo is attached yet; name one and I'll push it there as the initial commit).
- The brand name stays the literal placeholder `{{BRAND}}`, held in one constant: `src/content/site.ts` → `export const BRAND = "{{BRAND}}"`. Every page string, the nav wordmark, `<title>` and metadata read from it. No invented name anywhere.

## Stack (latest stable, checked on npm today, 2026-10-13)
| Package | Version |
|---|---|
| next (App Router, `output: "export"`) | 16.4.0 |
| react / react-dom | 19.3.0 |
| typescript (strict) | 7.0.2 * |
| tailwindcss + @tailwindcss/postcss | 4.3.3 |
| motion (`motion/react`) | 14.1.0 |
| lucide-react | 1.55.0 |
| eslint + eslint-config-next (flat config) | 10.12.0 / 16.4.0 |
| prettier + prettier-plugin-tailwindcss | 3.9.10 / 0.8.1 |
| @playwright/test | 1.64.0 |

\* TypeScript 7 is the new native compiler. If Next's build-time type check or typescript-eslint doesn't support it yet, I'll pin the newest 6.x/5.x line that does and record why in CLAUDE.md, rather than ship a broken toolchain.

Exact versions are pinned in `package.json` (no `^`) so builds are reproducible. No UI kit; every component is hand-built.

## Fonts (GDPR)
`next/font/google` for Space Grotesk (600/700), Inter (400/500) and JetBrains Mono (400/500). It downloads the files at **build time** and serves them from our own origin, so visitors never hit Google. Exposed as CSS variables (`--font-display`, `--font-body`, `--font-mono`) that feed `@theme`. A Playwright test asserts no request goes to `fonts.googleapis.com` / `fonts.gstatic.com`.

## File layout
```
CLAUDE.md                     brief verbatim, motion rules, perf budget, conventions, NEVER list
next.config.ts                output: "export", images.unoptimized
eslint.config.mjs  .prettierrc  playwright.config.ts  tsconfig.json (strict + noUncheckedIndexedAccess)
src/styles/tokens.css         all colour / type / radius / motion tokens + @theme wiring
src/app/globals.css           @import "tailwindcss"; @import tokens; base layer
src/app/layout.tsx            fonts, metadata from BRAND, light color-scheme only
src/app/page.tsx              shell: Nav, 8 empty sections, Footer
src/components/nav/Nav.tsx    client component (scroll state + hover underline)
src/components/nav/NavLink.tsx
src/components/ui/Button.tsx  primary + ghost variants
src/components/Section.tsx    anchor wrapper with scroll-margin for the sticky nav
src/components/Footer.tsx
src/lib/motion.ts             easings, durations, stagger, HEARTBEAT_MS, useMotionVariants()
src/content/site.ts           BRAND, nav items, section ids
src/content/demo.ts           every demo number, each tagged DEMO (empty-ish for now)
public/media/README.md        expected video files + specs
public/media/*-poster.avif    7 neutral placeholder posters
tests/smoke.spec.ts  tests/screenshot.spec.ts
scripts/check-budget.mjs      gzipped initial-JS budget check on the export
```

## Tasks
1. **Scaffold + tokens.** `tokens.css` declares every brief colour (paper, surface, ink, ink-muted, line, signal, pulse, aurora, live, alert), the aurora gradient, radii (16/20/24), hairline width, the three font families with display tracking −0.02em, and motion tokens (`--ease-entrance: cubic-bezier(0.22,1,0.36,1)`, `--duration-micro-*`, `--duration-entrance-*`, `--stagger`, `--heartbeat: 2400ms`) inside `@theme`, so `bg-paper`, `text-ink`, `font-display`, `ease-entrance` etc. work as utilities. `pulse` is marked graphics-only in a comment and not exposed as a text utility.
2. **CLAUDE.md.** Brief verbatim, motion rules, perf budget, file conventions, NEVER list, plus the `{{BRAND}}` constant rule.
3. **`src/lib/motion.ts`.** `EASE`, `DURATION`, `STAGGER`, `SPRING = {stiffness:300, damping:30}`, `HEARTBEAT_MS = 2400`, a `heartbeatDelay(i)` phase-offset helper, and `useMotionVariants()` built on motion's `useReducedMotion`: with reduced motion, entrances become opacity-only/instant and ambient loops are disabled.
4. **Page shell.** Sticky translucent nav: wordmark placeholder (`BRAND` in Space Grotesk), Products, Use cases, Security, Pricing, Docs, a "Talk to us" ghost button and a "Deploy an agent" primary button; mobile gets a simple disclosure menu (no scroll lock tricks). Empty sections `#hero #products #how #use-cases #security #pricing #faq #cta` with min-heights so anchors are testable, and a footer stub. Skip-to-content link for a11y.
5. **Nav micro-interactions.** Underline is a 1px `signal` bar that scales in from the left (`transform-origin: left`, 200 ms, entrance easing), CSS-only so it costs no JS; it also shows on keyboard focus. Past 24px of scroll the nav gains a `line` hairline border and a light `backdrop-blur` with a frosted surface tint, via a passive scroll listener toggling a data attribute (CSS transitions, no re-render per frame).
6. **Media.** `public/media/README.md` lists brand-film.{webm,mp4}, brand-film-poster.avif, brand-film.en.vtt and the six vertical-*.{webm,mp4} + posters, with suggested resolution, duration (multiples of 2.4 s for loops), muted/no audio track, and size targets. I'll generate 7 neutral AVIF posters (paper background, faint hairline grid, small label) so layout never depends on video.

## Budget enforcement (now, not later)
- `npm run check:budget`: builds the export and fails if gzipped first-load JS for `/` exceeds 150 KB (the future lazy hero-canvas chunk is excluded by name).
- Playwright smoke: page loads, all 8 anchors exist, nav links scroll to them, nav gets its border after scrolling, no external font requests, no console errors.
- Playwright screenshots at 390px and 1440px saved for review.
- Lighthouse mobile run (via the installed Chromium) with the four thresholds; scores recorded in CLAUDE.md. LCP/CLS/INP are recorded from that run too.
- No video, WebGL or 3D in the critical path; motion is only loaded where a component needs it.

## Defaults I'm picking (say if you want otherwise)
- Light theme only: `color-scheme: light`, no dark-mode media query.
- Nav links point to the on-page anchors; "Docs" points to `#` until there's a docs URL.
- Buttons point to `#cta` for now.
- No analytics, no cookies, no third-party requests at all.

## Deliverable at the end
The project folder, passing lint/typecheck/build/tests, with screenshots and the Lighthouse + bundle numbers in my reply.
