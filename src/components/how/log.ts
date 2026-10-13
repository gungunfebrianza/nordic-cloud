import { DEMO_HOW_LOGS } from "@/content/demo";
import { HEARTBEAT_MS } from "@/lib/motion-constants";

/** Shared by the server render and the lazy controller, so streamed lines continue seamlessly. */
export const LOG_VISIBLE = 9;
const LINES = DEMO_HOW_LOGS.value.lines;

export function logLine(i: number) {
  const [h, m, s] = DEMO_HOW_LOGS.value.start.split(":").map(Number) as [number, number, number];
  const t = Math.floor(h * 3600 + m * 60 + s + (i * HEARTBEAT_MS) / 1000) % 86_400;
  const pad = (n: number) => String(n).padStart(2, "0");
  const [level, msg] = LINES[i % LINES.length]!;
  return {
    time: `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`,
    level,
    msg,
  };
}

export function formatUptime(seconds: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor(seconds / 60) % 60;
  return `${d}d ${pad(h)}:${pad(m)}:${pad(Math.floor(seconds % 60))}`;
}
