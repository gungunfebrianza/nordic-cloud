# #products: plan

Status: **approved and implemented** (2026-10-13).

## How it fits the budget
Initial JS is 136.5 of 150 KB, so the motion library can't go in the initial bundle. I'll use the hero's pattern:
- **Server-rendered first.** Cards, copy and all three diagrams are server-rendered HTML and SVG, so the section is complete and readable with no JS.
- **Tiny client hook.** A ~1 KB component watches the section. When it gets near the viewport, it lazy-loads `products-motion.ts`.
- **Motion in the lazy chunk.** That chunk uses motion's own `animate()` API (from `motion`, the same package) to animate the existing SVG elements. It's never in the initial HTML, and I'll report its gzipped size.
- **Why not React components?** Using motion's React components (`motion/react`) would put the motion library in the initial bundle and break the 150 KB budget.

The hover speed-up uses motion's playback speed: every diagram's animation controls switch to `speed = 1.5` on hover or focus, and back to 1 afterwards.

## Files
```
src/content/products.ts                 heading, card copy, price placeholders, compare-table placeholders
src/components/products/Products.tsx    server: section, heading, cards, compare toggle
src/components/products/ProductCard.tsx server: card shell, diagram slot, copy, bullets, price, Explore link
src/components/products/diagrams/{BotsDial,VpsBlock,ClusterRing}.tsx   server: static SVG
src/components/products/ProductsMotion.tsx   client: loads the motion chunk near the viewport, wires hover/focus
src/components/products/products-motion.ts   lazy: all diagram animation + card stagger, via motion animate()
src/components/products/CompareTable.tsx     client: expand/collapse
src/components/products/products.css         card hover/focus, aurora border, arrow nudge, table expand
tests/products.spec.ts
```

## Diagrams (each motion explains something)
- **Always-on bots** (uptime, scheduling)
  - An agent node with a heartbeat ring every 2.4 s, inside a 24-hour dial with 24 tick marks.
  - The hand sweeps once every 9.6 s, which is 4 heartbeats, so it stays on the beat.
  - Six ticks are "scheduled tasks". Each turns live-green as the hand passes it and resets at the top of the dial, so the loop is seamless.
  - Mono caption: "cron · webhooks · queues".
- **Agent VPS** (dedicated resources, isolation)
  - A server block with four labelled lanes: CPU, GPU, MEM and NET. Each has a micro-sparkline scrolling left on a seamless 4.8 s loop (two heartbeats).
  - The lines have no numbers or axes. They're illustrative shapes, not metrics, so there's nothing to mark DEMO.
  - The dashed isolation boundary around the block glows signal-blue on card hover. It stays still: no marching dashes.
- **Multi-agent clusters** (coordination)
  - Five agents in a ring around an orchestrator, with packets passing orchestrator↔agent and agent↔agent at 0.8–1.6 s per hop.
  - On hover, a shared-memory hexagon fades in at the centre in aurora violet, with links to every agent.
  - **Fork:** the brief puts both the orchestrator and the hexagon at the centre. **Default:** the hexagon appears around the orchestrator, with the orchestrator inside it, as one shared hub.

## Card copy (drafts, please edit freely)
| | Always-on bots | Agent VPS | Multi-agent clusters |
|---|---|---|---|
| Line | Single agents that run 24/7. | Dedicated servers, pre-built for agent runtimes. | Orchestrated teams of agents that share what they know. |
| Bullets | Scheduled, event-driven or webhook-triggered · Automatic restarts and health checks · Logs and traces for every run | Isolated VM per workload · GPU optional · Agent runtimes pre-installed | Shared memory and queues · One orchestrator, many agents · Observability across the team |
| Caption | cron · webhooks · queues | cpu · gpu · isolated | memory · queues · traces |
| Price | from €{{PRICE_BOTS}}/mo | from €{{PRICE_VPS}}/mo | from €{{PRICE_CLUSTERS}}/mo |

- **Price placeholders.** These stay literal placeholders, like `{{BRAND}}`, held in single constants in `src/content/products.ts`.
- **"Explore →" links.** For now they point to `#pricing`, until product pages exist.
- **Captions.** You only gave one caption, so the VPS and cluster captions are my drafts.

## Interactions
- **Hover or focus on a card:**
  - It lifts 4px with the spring easing from the hero.
  - A 1px aurora border fades in. Only one card is hovered at a time, so the aurora rule holds.
  - Its diagram runs at 1.5× speed.
  - The "Explore →" arrow nudges 4px.
- **Keyboard:** each card has one tab stop, its Explore link. The link stretches over the whole card, so the entire card is clickable, and `:focus-within` makes focus look exactly like hover. This avoids two tab stops per card.
- **Stagger on scroll:** the cards rise and fade in once, 750 ms each with a 70 ms stagger, when the section scrolls into view.
  - The cards are hidden only after the motion chunk has loaded and the section is still off-screen.
  - If someone lands with the section already visible (via the #products link), or JS fails, the cards simply show.
- **Off-screen:** diagram loops pause when the section is out of view.
- **Compare plans:**
  - A button with `aria-expanded` expands the table: height plus fade, 300 ms, as you asked.
  - Height uses the CSS grid `0fr → 1fr` technique, so it works in every browser without measuring.
  - When collapsed, the table is `inert`, so it can't be tabbed into.
  - The table has a column per product and placeholder rows (`Row 1 (placeholder)` / `—`) in `products.ts` for you to fill in.

## Reduced motion
- Diagrams are static: the dial hand is parked, some ticks are green, and the sparklines and cluster are still.
- Hover still changes state instantly: border, glow and hexagon, with no lift or speed-up.
- No stagger, and the table opens instantly.

## Checks
- **Tests:**
  - Diagrams and copy are in the HTML before JS, and the motion chunk isn't.
  - The hover and focus states match.
  - The speed switches to 1.5 on hover.
  - The table expands, collapses and is `inert` when closed.
  - Reduced motion is respected.
- **Screenshots** at 390 and 1440, at rest and on hover.
- **Budget, Lighthouse and frame rate.** I'll report the lazy motion chunk size, the budget, both Lighthouse modes, and the frame rate with all three diagrams running.
- **CLAUDE.md.** I'll update it with the lazy `animate()` pattern for below-the-fold motion.
