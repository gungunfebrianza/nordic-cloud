/**
 * The hero agent network: one deterministic graph shared by the static SVG snapshot (server)
 * and the live canvas (client), so the cross-fade between them lines up exactly.
 *
 * Positions are normalised to 0..1 on both axes and mapped onto whatever box renders them.
 * Node radii stay in CSS pixels, so dots are the same size on every screen.
 */

export type Tier = "core" | "agent" | "task";

export type GraphNode = {
  id: number;
  tier: Tier;
  /** Index within its tier (core-01 = 0). */
  rank: number;
  x: number;
  y: number;
  /** Heartbeat phase offset, 0..1 of a beat. */
  phase: number;
};

export type GraphLink = { id: number; a: number; b: number };

export type Graph = {
  nodes: GraphNode[];
  links: GraphLink[];
  /** Adjacency list: node id -> link ids. */
  adjacency: number[][];
};

export const NODE_RADIUS: Record<Tier, number> = { core: 5, agent: 3, task: 1.5 };
// Brief: core 10px, agent 6px, task 3px. Those are diameters; radii above.

export const COUNTS = { core: 3, agent: 12, task: 23 } as const; // 38 nodes, within 30–45

const SEED = 0x2400;

/** Mulberry32: small, fast, deterministic PRNG. */
export function rng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Layout runs in a 1.4:1 virtual box (roughly the desktop stage) and is then normalised. */
const ASPECT = 1.4;
const MARGIN = 0.07;

export function buildGraph(seed = SEED): Graph {
  const rand = rng(seed);
  const nodes: GraphNode[] = [];
  const add = (tier: Tier, rank: number, x: number, y: number) =>
    nodes.push({ id: nodes.length, tier, rank, x, y, phase: rand() });

  // Seed positions: cores near the centre, agents on a loose ring, tasks near their agent.
  const cx = ASPECT / 2;
  const cy = 0.5;
  const coreSeeds = [
    [-0.16, -0.06],
    [0.14, -0.12],
    [0.02, 0.15],
  ] as const;
  coreSeeds.forEach(([dx, dy], i) => add("core", i, cx + dx, cy + dy));
  for (let i = 0; i < COUNTS.agent; i++) {
    const a = (i / COUNTS.agent) * Math.PI * 2 + rand() * 0.3;
    const r = 0.3 + rand() * 0.08;
    add("agent", i, cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r);
  }
  for (let i = 0; i < COUNTS.task; i++) {
    const agent = nodes[COUNTS.core + (i % COUNTS.agent)]!;
    const a = rand() * Math.PI * 2;
    add("task", i, agent.x + Math.cos(a) * 0.1, agent.y + Math.sin(a) * 0.08);
  }

  // Links: cores fully connected; each agent to one core and its two ring neighbours;
  // each task to one agent.
  const links: GraphLink[] = [];
  const link = (a: number, b: number) => links.push({ id: links.length, a, b });
  const nearestCore = (n: GraphNode) => {
    let best = 0;
    let bestD = Infinity;
    for (let c = 0; c < COUNTS.core; c++) {
      const d = (nodes[c]!.x - n.x) ** 2 + (nodes[c]!.y - n.y) ** 2;
      if (d < bestD) [best, bestD] = [c, d];
    }
    return best;
  };
  const agentId = (i: number) => COUNTS.core + ((i + COUNTS.agent) % COUNTS.agent);
  link(0, 1);
  link(1, 2);
  link(2, 0);
  for (let i = 0; i < COUNTS.agent; i++) {
    link(agentId(i), nearestCore(nodes[agentId(i)]!));
    link(agentId(i), agentId(i + 1));
  }
  for (let i = 0; i < COUNTS.task; i++) link(COUNTS.core + COUNTS.agent + i, agentId(i));

  relax(nodes, links);
  normalise(nodes);

  const adjacency: number[][] = nodes.map(() => []);
  for (const l of links) {
    adjacency[l.a]!.push(l.id);
    adjacency[l.b]!.push(l.id);
  }
  return { nodes, links, adjacency };
}

/** A small force-directed relaxation: repulsion, link springs, gentle centring. */
function relax(nodes: GraphNode[], links: GraphLink[]) {
  const rest = (a: GraphNode, b: GraphNode) =>
    a.tier === "task" || b.tier === "task"
      ? 0.09
      : a.tier === "core" && b.tier === "core"
        ? 0.34
        : 0.22;
  const vx = new Float64Array(nodes.length);
  const vy = new Float64Array(nodes.length);

  for (let iter = 0; iter < 400; iter++) {
    const cool = 1 - iter / 400;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]!;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]!;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = Math.max(dx * dx + dy * dy, 1e-4);
        const f = 0.00045 / d2;
        vx[i]! += dx * f;
        vy[i]! += dy * f;
        vx[j]! -= dx * f;
        vy[j]! -= dy * f;
      }
    }
    for (const l of links) {
      const a = nodes[l.a]!;
      const b = nodes[l.b]!;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1e-4;
      const f = ((d - rest(a, b)) / d) * 0.08;
      vx[l.a]! += dx * f;
      vy[l.a]! += dy * f;
      vx[l.b]! -= dx * f;
      vy[l.b]! -= dy * f;
    }
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]!;
      vx[i]! += (ASPECT / 2 - n.x) * 0.004;
      vy[i]! += (0.5 - n.y) * 0.004;
      n.x += vx[i]! * cool;
      n.y += vy[i]! * cool;
      vx[i]! *= 0.6;
      vy[i]! *= 0.6;
    }
  }
}

function normalise(nodes: GraphNode[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y);
  }
  const span = 1 - MARGIN * 2;
  for (const n of nodes) {
    n.x = Number((MARGIN + ((n.x - minX) / (maxX - minX)) * span).toFixed(4));
    n.y = Number((MARGIN + ((n.y - minY) / (maxY - minY)) * span).toFixed(4));
  }
}

/** Agents a task can be routed through: a walk along agent ring links, 3–4 agents long. */
export function pickRoute(graph: Graph, rand: () => number): number[] {
  const agents = graph.nodes.filter((n) => n.tier === "agent");
  // Start at one of the three left-most agents, so the task visibly enters from the left.
  const leftmost = [...agents].sort((a, b) => a.x - b.x).slice(0, 3);
  const start = leftmost[Math.floor(rand() * leftmost.length)]!;
  const length = 3 + (rand() < 0.5 ? 1 : 0);
  const route = [start.id];
  while (route.length < length) {
    const here = route[route.length - 1]!;
    const next = graph.adjacency[here]!.map((lid) => graph.links[lid]!)
      .map((l) => (l.a === here ? l.b : l.a))
      .filter((id) => graph.nodes[id]!.tier === "agent" && !route.includes(id))
      .sort((a, b) => graph.nodes[b]!.x - graph.nodes[a]!.x); // prefer moving right
    if (next.length === 0) break;
    route.push(next[rand() < 0.75 ? 0 : next.length - 1]!);
  }
  return route;
}

export const GRAPH = buildGraph();
