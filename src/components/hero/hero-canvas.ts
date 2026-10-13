/**
 * Live agent network for the hero: a 2D canvas renderer, loaded lazily after first paint.
 * Plain TypeScript, no React and no libraries, so the chunk stays small.
 *
 * What each motion explains:
 *   heartbeat rings  → every node is alive (uptime), on HEARTBEAT_MS with per-node phase
 *   packets + links  → data flowing between agents (pulse colour on links carrying traffic)
 *   routed task      → a task entering, passing through agents, and completing (aurora path,
 *                      live-green check)
 *   pointer drift    → the network responds to you; tooltips name what each agent does
 */

import { DEMO_NODE_LABELS } from "@/content/demo";
import { HEARTBEAT_MS, SPRING, packetHopDuration } from "@/lib/motion-constants";
import { GRAPH, NODE_RADIUS, pickRoute, type GraphNode } from "./graph";

export const RENDERER_ID = "hero-canvas-2d";

const PACKET_COUNT = 14;
const TASK_INTERVAL_MS = 6000;
const POINTER_RADIUS = 120;
const POINTER_PULL = 10; // max px a node drifts toward the cursor
const HOVER_SLOP = 8;
const MAX_DPR = 2;
const LINK_COOL_S = 0.45;

type Colours = Record<
  "paper" | "surface" | "ink" | "line" | "signal" | "pulse" | "aurora" | "live",
  string
>;

type Packet = { link: number; from: number; to: number; t0: number; dur: number };

type Task = {
  route: number[];
  entryY: number; // normalised
  hops: number[]; // seconds per hop, entry hop first
  t0: number;
};

type Stats = { frames: number[]; drawMs: number[] };

export type HeroCanvasOptions = {
  canvas: HTMLCanvasElement;
  tooltip: HTMLElement;
  onFirstFrame?: () => void;
};

export type HeroCanvasHandle = { destroy: () => void };

export function mountHeroCanvas({
  canvas,
  tooltip,
  onFirstFrame,
}: HeroCanvasOptions): HeroCanvasHandle {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { destroy() {} };
  canvas.dataset.renderer = RENDERER_ID;

  const colours = readColours();
  const { nodes, links, adjacency } = GRAPH;
  const n = nodes.length;
  const labels = DEMO_NODE_LABELS.value;

  // Per-node pointer drift, integrated as a spring (stiffness 300, damping 30).
  const ox = new Float32Array(n);
  const oy = new Float32Array(n);
  const vx = new Float32Array(n);
  const vy = new Float32Array(n);
  const heat = new Float32Array(links.length);

  let w = 0;
  let h = 0;
  let dpr = 1;
  let sim = 0; // seconds of simulated time; pauses while hidden, so nothing jumps on resume
  let last = 0;
  let raf = 0;
  let onScreen = true;
  let tabVisible = document.visibilityState === "visible";
  let first = true;
  let pointer: { x: number; y: number } | null = null;
  let hovered = -1;

  const stats = (window as unknown as { __HERO_STATS__?: Stats }).__HERO_STATS__;

  // ── Packets: continuous flow; each packet hops on to a neighbouring link when it arrives.
  const packets: Packet[] = [];
  for (let i = 0; i < PACKET_COUNT; i++) {
    const link = links[Math.floor(Math.random() * links.length)]!;
    const forward = Math.random() < 0.5;
    const p: Packet = {
      link: link.id,
      from: forward ? link.a : link.b,
      to: forward ? link.b : link.a,
      t0: 0,
      dur: 1,
    };
    p.dur = hopSeconds(p.from, p.to);
    p.t0 = -Math.random() * p.dur; // start mid-flight so the scene is already alive
    packets.push(p);
  }

  // ── Tasks: one enters every TASK_INTERVAL_MS.
  let task: Task | null = null;
  let nextTaskAt = 1.2;

  function newTask(t0: number): Task {
    const route = pickRoute(GRAPH, Math.random);
    const firstNode = nodes[route[0]!]!;
    const entryY = firstNode.y;
    const hops = [hopSecondsXY(0, entryY, firstNode.x, firstNode.y)];
    for (let i = 1; i < route.length; i++) hops.push(hopSeconds(route[i - 1]!, route[i]!));
    return { route, entryY, hops, t0 };
  }

  // ── Geometry helpers (CSS px).
  const px = (node: GraphNode) => node.x * w + ox[node.id]!;
  const py = (node: GraphNode) => node.y * h + oy[node.id]!;

  function hopSecondsXY(ax: number, ay: number, bx: number, by: number) {
    const len = Math.hypot((bx - ax) * (w || 640), (by - ay) * (h || 480));
    return packetHopDuration(len);
  }
  function hopSeconds(a: number, b: number) {
    const na = nodes[a]!;
    const nb = nodes[b]!;
    return hopSecondsXY(na.x, na.y, nb.x, nb.y);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    if (!raf) draw(); // keep a correct still frame while paused
  }

  // ── Simulation step.
  function step(dt: number) {
    sim += dt;

    // Pointer drift with spring physics.
    const k = SPRING.stiffness;
    const c = SPRING.damping;
    for (let i = 0; i < n; i++) {
      const node = nodes[i]!;
      let tx = 0;
      let ty = 0;
      if (pointer) {
        const dx = pointer.x - node.x * w;
        const dy = pointer.y - node.y * h;
        const d = Math.hypot(dx, dy);
        if (d < POINTER_RADIUS && d > 0.001) {
          const pull = (1 - d / POINTER_RADIUS) * POINTER_PULL;
          tx = (dx / d) * pull;
          ty = (dy / d) * pull;
        }
      }
      vx[i]! += (k * (tx - ox[i]!) - c * vx[i]!) * dt;
      vy[i]! += (k * (ty - oy[i]!) - c * vy[i]!) * dt;
      ox[i]! += vx[i]! * dt;
      oy[i]! += vy[i]! * dt;
    }

    // Links cool down unless a packet is on them.
    for (let i = 0; i < heat.length; i++) heat[i] = Math.max(0, heat[i]! - dt / LINK_COOL_S);

    for (const p of packets) {
      if (sim - p.t0 >= p.dur) {
        const from = p.to;
        const options = adjacency[from]!.filter((lid) => lid !== p.link);
        const lid = options.length ? options[Math.floor(Math.random() * options.length)]! : p.link;
        const l = links[lid]!;
        p.link = lid;
        p.from = from;
        p.to = l.a === from ? l.b : l.a;
        p.t0 += p.dur;
        if (sim - p.t0 > 1) p.t0 = sim; // after a long pause, don't fast-forward
        p.dur = hopSeconds(p.from, p.to);
      }
      heat[p.link] = 1;
    }

    if (sim >= nextTaskAt) {
      task = newTask(sim);
      nextTaskAt = sim + TASK_INTERVAL_MS / 1000;
    }
  }

  // ── Drawing.
  function draw() {
    if (!ctx || w === 0) return;
    const t0 = stats ? performance.now() : 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";

    // Idle links, one batched path.
    ctx.lineWidth = 1;
    ctx.strokeStyle = colours.line;
    ctx.beginPath();
    for (const l of links) {
      const a = nodes[l.a]!;
      const b = nodes[l.b]!;
      ctx.moveTo(px(a), py(a));
      ctx.lineTo(px(b), py(b));
    }
    ctx.stroke();

    // Links carrying traffic brighten to pulse.
    ctx.strokeStyle = colours.pulse;
    for (const l of links) {
      const v = heat[l.id]!;
      if (v <= 0.01) continue;
      const a = nodes[l.a]!;
      const b = nodes[l.b]!;
      ctx.globalAlpha = 0.6 * v;
      ctx.beginPath();
      ctx.moveTo(px(a), py(a));
      ctx.lineTo(px(b), py(b));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    drawTask();

    // Packets: small glowing pulse dots.
    for (const p of packets) {
      const f = Math.min(1, Math.max(0, (sim - p.t0) / p.dur));
      const a = nodes[p.from]!;
      const b = nodes[p.to]!;
      const x = px(a) + (px(b) - px(a)) * f;
      const y = py(a) + (py(b) - py(a)) * f;
      ctx.fillStyle = colours.pulse;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, 1.75, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heartbeat rings: scale 1 → 2.6 and fade out by 70% of the beat, like the CSS keyframes.
    const beat = (sim * 1000) / HEARTBEAT_MS;
    ctx.lineWidth = 1;
    for (const node of nodes) {
      const p = (beat + node.phase) % 1;
      const alpha = 0.55 * Math.max(0, 1 - p / 0.7);
      if (alpha <= 0.01) continue;
      const r = NODE_RADIUS[node.tier] * (1 + 1.6 * p);
      ctx.globalAlpha = node.tier === "task" ? alpha * 0.8 : alpha;
      ctx.strokeStyle = node.tier === "task" ? colours.pulse : colours.signal;
      ctx.beginPath();
      ctx.arc(px(node), py(node), r + (node.tier === "core" ? 2 : 1), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Nodes.
    for (const node of nodes) {
      const x = px(node);
      const y = py(node);
      const r = NODE_RADIUS[node.tier];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (node.tier === "core") {
        ctx.fillStyle = colours.signal;
        ctx.fill();
      } else if (node.tier === "agent") {
        ctx.fillStyle = colours.surface;
        ctx.fill();
        ctx.lineWidth = node.id === hovered ? 2 : 1.25;
        ctx.strokeStyle = colours.signal;
        ctx.stroke();
      } else {
        ctx.fillStyle = colours.pulse;
        ctx.fill();
      }
      if (node.id === hovered && node.tier !== "agent") {
        ctx.lineWidth = 1;
        ctx.strokeStyle = colours.ink;
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (stats) stats.drawMs.push(performance.now() - t0);
  }

  function drawTask() {
    if (!ctx || !task) return;
    const pts: [number, number][] = [[0, task.entryY * h]];
    for (const id of task.route) pts.push([px(nodes[id]!), py(nodes[id]!)]);

    const elapsed = sim - task.t0;
    const travel = task.hops.reduce((s, v) => s + v, 0);

    // Where the token is: hop index and progress along it.
    let hop = 0;
    let acc = 0;
    while (hop < task.hops.length && elapsed > acc + task.hops[hop]!) acc += task.hops[hop++]!;
    const f = hop < task.hops.length ? (elapsed - acc) / task.hops[hop]! : 1;
    const done = elapsed >= travel;
    const fade = done ? Math.max(0, 1 - (elapsed - travel) / 1.4) : 1;
    if (fade <= 0) {
      task = null;
      return;
    }

    // Lit path in the aurora gradient (120deg: pulse → signal → aurora).
    const grad = ctx.createLinearGradient(0, h, w, 0);
    grad.addColorStop(0, colours.pulse);
    grad.addColorStop(0.5, colours.signal);
    grad.addColorStop(1, colours.aurora);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9 * fade;
    ctx.beginPath();
    ctx.moveTo(pts[0]![0], pts[0]![1]);
    let tx = pts[0]![0];
    let ty = pts[0]![1];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1]!;
      const [bx, by] = pts[i]!;
      if (i - 1 < hop || done) {
        ctx.lineTo(bx, by);
        tx = bx;
        ty = by;
      } else if (i - 1 === hop) {
        tx = ax + (bx - ax) * f;
        ty = ay + (by - ay) * f;
        ctx.lineTo(tx, ty);
        break;
      }
    }
    ctx.stroke();

    if (!done) {
      // The task itself: a signal dot with a soft halo.
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = colours.signal;
      ctx.beginPath();
      ctx.arc(tx, ty, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Completed: a live-green check just past the last agent.
      const [lx, ly] = pts[pts.length - 1]!;
      const cx = Math.min(w - 14, lx + 18);
      const cy = ly - 14;
      const pop = Math.min(1, (elapsed - travel) / 0.25);
      ctx.globalAlpha = fade;
      ctx.fillStyle = colours.live;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 * (0.6 + 0.4 * pop), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colours.surface;
      ctx.lineWidth = 1.75;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 3.2, cy + 0.2);
      ctx.lineTo(cx - 0.8, cy + 2.6);
      ctx.lineTo(cx + 3.4, cy - 2.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ── Loop with pause/resume.
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    if (stats) stats.frames.push(now);
    step(dt);
    draw();
    if (first) {
      first = false;
      onFirstFrame?.();
    }
  }

  function sync() {
    const run = onScreen && tabVisible;
    canvas.dataset.running = String(run);
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  // ── Pointer: drift + tooltip.
  function onMove(e: PointerEvent) {
    if (e.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    let best = -1;
    let bestD = Infinity;
    for (const node of nodes) {
      const d = Math.hypot(px(node) - pointer.x, py(node) - pointer.y);
      if (d < NODE_RADIUS[node.tier] + HOVER_SLOP && d < bestD) {
        best = node.id;
        bestD = d;
      }
    }
    setHover(best);
  }
  function onLeave() {
    pointer = null;
    setHover(-1);
  }
  function setHover(id: number) {
    if (id === hovered) {
      if (id >= 0) placeTooltip(nodes[id]!);
      return;
    }
    hovered = id;
    if (id < 0) {
      tooltip.dataset.visible = "false";
      return;
    }
    const node = nodes[id]!;
    const list = labels[node.tier];
    tooltip.textContent = list[node.rank % list.length]!;
    tooltip.dataset.visible = "true";
    placeTooltip(node);
  }
  function placeTooltip(node: GraphNode) {
    const tw = tooltip.offsetWidth;
    const x = Math.min(Math.max(8, px(node) - tw / 2), w - tw - 8);
    const y = Math.max(4, py(node) - 40);
    tooltip.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true;
    sync();
  });
  io.observe(canvas);
  const onVisibility = () => {
    tabVisible = document.visibilityState === "visible";
    sync();
  };
  document.addEventListener("visibilitychange", onVisibility);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  resize();
  sync();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      tooltip.dataset.visible = "false";
    },
  };
}

/** Read brand colours from the CSS tokens, so tokens.css stays the single source of truth. */
function readColours(): Colours {
  const s = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) =>
    s.getPropertyValue(`--color-${name}`).trim() || fallback;
  return {
    paper: get("paper", "#f6f8fc"),
    surface: get("surface", "#ffffff"),
    ink: get("ink", "#0a1020"),
    line: get("line", "#e3e8f2"),
    signal: get("signal", "#2962ff"),
    pulse: get("pulse", "#00c8ff"),
    aurora: get("aurora", "#7b5cff"),
    live: get("live", "#10c98a"),
  };
}
