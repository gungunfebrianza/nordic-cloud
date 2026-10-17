# #hero: plan

Status: **approved and implemented** (2026-10-13). Revised 06:12 UTC: the CTA border is static, fades in, and emits one heartbeat ring.

Builds on the scaffold in `/mnt/project-files/nordic-futures-site/` and follows its CLAUDE.md.

## Files
```
src/components/hero/Hero.tsx              server component: layout, copy, CTAs, trust row
src/components/hero/AgentsOnlineChip.tsx  client: live dot + drifting DEMO count
src/components/hero/NetworkStage.tsx      client: shows the SVG, lazy-loads the canvas, cross-fades
src/components/hero/NetworkSnapshot.tsx   server: static inline SVG of the same graph (first paint)
src/components/hero/hero-canvas.ts        the lazy canvas module (2D), plain TS, no React
src/components/hero/graph.ts              seeded graph + force layout, shared by SVG and canvas
src/components/hero/hero.css              dot grid, aurora glow, word rise, CTA hover, aurora border
src/content/hero.ts                       copy (H1, sub, CTAs, trust row)
src/content/demo.ts                       + agentsOnline 2418 (DEMO), drift range, node tooltip strings (DEMO)
tests/hero.spec.ts                        behaviour, reduced motion, pause, screenshots 390 + 1440
scripts/measure-fps.mjs                   frame rate + per-frame cost of the canvas
```

## Layout
- Desktop: 12-column grid. Copy spans 5 columns and the visualisation spans 7. Mobile: copy first, then the visualisation at 320px tall.
- Background: paper, a 24px dot grid drawn with a `radial-gradient` in the line colour, and one large aurora glow behind the visualisation at about 12% opacity. I'll draw the glow as a pre-softened radial gradient, not a `filter: blur()`. It looks the same and costs far less to paint.

## Copy
I'll use your copy exactly as written: the eyebrow chip, H1, sub, the "Deploy your first agent" and "See how it works" CTAs, and the trust row with lucide line icons (`Globe2`/`ShieldCheck`/`Activity`). "See how it works" scrolls to `#how` with native smooth scroll, and reduced motion turns that off.

**Chip.** The green dot uses the existing `animate-heartbeat` ring. The number comes from `DEMO.agentsOnline` and drifts by ±1–6 every 3–5 s. It has a `TODO: wire real endpoint` comment and isn't announced to screen readers on each change.

## Live agent network
- **One graph, two renderers.** `graph.ts` builds 38 nodes from a fixed seed: 3 core, 12 agent and 23 task. It runs a small force layout. The server renders the result as inline SVG, so first paint shows the real graph and the H1 stays the LCP element. The canvas uses the same coordinates, so the cross-fade lines up exactly.
- **Lazy canvas.** After the page loads and the browser is idle (`requestIdleCallback`), and only once the stage is near the viewport (`IntersectionObserver`; on mobile it sits below the copy), I `import()` `hero-canvas.ts`. Once its first frame is drawn, it fades in over the SVG in 600 ms, and then the SVG is hidden.
- **2D, not WebGL.** About 40 nodes, 60 links, 20–30 packets and some rings come to a few hundred draw calls a frame, which is comfortably within what 2D canvas handles. WebGL would add a large dependency or shader code and gain nothing at this scale. I'll measure it and report the numbers (see Measurement).
- **What it draws**, all from the brief:
  - Core nodes: signal colour, 10px. Agent nodes: white with a signal outline, 6px. Task nodes: pulse colour, 3px.
  - Links are 1px in the line colour, and brighten to pulse while a packet is on them.
  - Packets travel continuously at 0.8–1.6 s per hop, scaled to link length.
  - Each node emits a heartbeat ring every 2.4 s, with a phase offset from `heartbeatPhase()`.
  - Every 6 s (2.5 heartbeats, so it stays on the beat at half-beat precision), a task enters at the left edge. It is routed through 3–4 agents, the path lights in the aurora gradient, and it exits as a live-green check.
- **Pointer.** Nodes within 120px drift gently toward the cursor and spring back, using the brief's 300/30 spring. Hovering a node shows a small mono tooltip as a real DOM element, for example "agent-07 · reconciling ledger · up 312 d". The strings come from `demo.ts`.
- **Hygiene.** The animation pauses when the hero is off-screen or the tab is hidden. `devicePixelRatio` is capped at 2. The canvas resizes with `ResizeObserver`. The stage is `role="img"` with a plain-language label, and the canvas itself is `aria-hidden`.
- **Reduced motion.** The canvas never loads. The static SVG stays, and only the core node gets one slow CSS pulse.

## Micro-animations
- **H1 words** rise in with a 70 ms stagger. To protect LCP, the words are fully opaque from the first frame and only move up about 0.35em, in 750 ms, with the entrance easing. Chrome doesn't count text hidden at opacity 0 for LCP until it appears, so a fade-in would push LCP past the 2.0 s budget. This is pure CSS and needs no JS.
- **CTAs** lift 2px on hover with a soft signal-blue glow. CSS uses `linear()` easing that approximates the 300/30 spring.
- **Primary CTA on hover**: a static 1px aurora border fades in over 200 ms, and the button emits one heartbeat ring (a single 2.4 s expand-and-fade, not a loop). No rotation. Under reduced motion the border still appears, without the fade or the ring. Pure CSS.

## Budget
- **No motion library on this screen.** Everything above the canvas is CSS. That keeps initial JS at about 135 KB plus around 2 KB for the chip and stage. The canvas chunk is a dynamic import, so it never appears in the initial HTML and the budget script already leaves it out.
- **Canvas chunk** target: ≤ 12 KB gzipped. I'll report the real size.
- The inline SVG adds roughly 6–8 KB to the HTML before compression and about 2 KB after. I'll confirm LCP stays under 2.0 s with Lighthouse.

## Measurement (reported at the end)
- **Canvas chunk size:** gzipped, read from the build output.
- **Frame rate:** Playwright runs the hero for 10 s and records rAF frame intervals and the script time per frame. I'll run it twice: unthrottled, and with 4× CPU throttling as a stand-in for a mid-range laptop. These are measured in a headless cloud sandbox, not on real hardware, and I'll say that next to the numbers.

## Tests
- The SVG snapshot is present in the HTML before any JS runs, and the H1 is the LCP element.
- The canvas loads, fades in, and pauses when the tab is hidden or the hero scrolls away.
- Reduced motion: no canvas request, and the SVG stays.
- The chip number drifts and stays within range. The tooltip appears on node hover.
- "See how it works" lands on `#how`.
- Screenshots at 390 and 1440 wide.
- Re-run Lighthouse and the budget checks.

## Points where I picked a default (say if you want otherwise)
1. **The 2,418 count is invented.** The NEVER list forbids invented metrics shown as real. The value lives in `demo.ts` and is flagged `DEMO`, but visitors would still read "2,418 agents online now" as a fact. **Default:** while the value is demo data, the chip shows a tiny mono "demo" tag. It disappears automatically once the endpoint is wired. The alternative is to hide the chip in production builds until then.
2. **Aurora count.** At rest only the glow uses the aurora. Hovering the primary CTA adds the border, and every 6 s the task path adds a brief third use. That briefly exceeds the "1–2 elements per screen" rule. **Default:** I'll accept the brief overlap because the path is short-lived. Otherwise, the task path can use signal blue.
3. **Fonts.** The scaffold already self-hosts all three families, so nothing changes here.
