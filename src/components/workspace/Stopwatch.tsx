"use client";
import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

/** Per-problem practice timer (persists across reloads) — train your exam pace. */
export default function Stopwatch({ slug }: { slug: string }) {
  const key = `cc-timer:${slug}`;
  const [state, setState] = useState<{ acc: number; since: number | null }>({ acc: 0, since: null });
  const [, tick] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setState(raw ? JSON.parse(raw) : { acc: 0, since: Date.now() }); // auto-start on first open
    } catch {
      setState({ acc: 0, since: Date.now() });
    }
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  useEffect(() => {
    if (!state.since) return;
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [state.since]);

  const ms = state.acc + (state.since ? Date.now() - state.since : 0);
  const s = Math.floor(ms / 1000);
  const label = `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ":" : ""}${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const running = !!state.since;
  const over = s > 40 * 60;

  return (
    <div
      className={`ml-2 hidden items-center gap-1 rounded-md border px-1.5 py-0.5 sm:flex ${over ? "border-medium/50 text-medium" : "border-border text-muted"}`}
      title={over ? "Over 40 minutes — consider a hint" : "Time spent on this problem"}
    >
      <Timer className="size-3.5" />
      <span className="w-12 text-center font-mono text-xs tabular-nums">{label}</span>
      <button
        onClick={() => setState(running ? { acc: ms, since: null } : { acc: state.acc, since: Date.now() })}
        className="rounded p-0.5 hover:bg-surface-2 hover:text-text"
        title={running ? "Pause" : "Resume"}
      >
        {running ? <Pause className="size-3" /> : <Play className="size-3" />}
      </button>
      <button onClick={() => setState({ acc: 0, since: Date.now() })} className="rounded p-0.5 hover:bg-surface-2 hover:text-text" title="Restart timer">
        <RotateCcw className="size-3" />
      </button>
    </div>
  );
}
