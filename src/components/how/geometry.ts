import { EUROPE } from "./europe-data";

/** The #how scene: one 480×420 SVG shared by the desktop panel and the mobile step visuals. */
export const SCENE = { w: 480, h: 420 } as const;

/** Where the map sits in the scene. */
export const MAP = { x: Math.round((SCENE.w - EUROPE.width) / 2), y: 10 } as const;

/** The deployed agent's node: Copenhagen, in scene coordinates. */
export const NODE = { x: MAP.x + EUROPE.copenhagen.x, y: MAP.y + EUROPE.copenhagen.y } as const;

/** Step 3: agents that spawn around the deployed one. Packets take 1.6 s per hop; 3 hops = 4.8 s = 2 heartbeats. */
export const TEAM = { spawned: 4, radius: 92, hopS: 1.6 } as const;

export function teamPos(i: number) {
  const a = -Math.PI / 4 + (i * 2 * Math.PI) / TEAM.spawned;
  return {
    x: Math.round(NODE.x + TEAM.radius * Math.cos(a)),
    y: Math.round(NODE.y + TEAM.radius * Math.sin(a)),
  };
}

/** The node as a fraction of the scene, for the code panel's compress-to-node move (CSS). */
export const NODE_PCT = {
  x: +((NODE.x / SCENE.w) * 100).toFixed(2),
  y: +((NODE.y / SCENE.h) * 100).toFixed(2),
} as const;

/** One heartbeat of the dashboard's ECG-like graph, 120 units wide, baseline at y = 28. */
export const BEAT_W = 120;
export function beatPath(beats: number) {
  let d = "M0 28";
  for (let i = 0; i < beats; i++) {
    const x = i * BEAT_W;
    d +=
      `L${x + 30} 28Q${x + 36} 22 ${x + 42} 28L${x + 50} 28L${x + 54} 33` +
      `L${x + 59} 6L${x + 64} 40L${x + 68} 28L${x + 80} 28Q${x + 88} 18 ${x + 96} 28L${x + 120} 28`;
  }
  return d;
}
