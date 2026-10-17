"use client";
import { useMemo } from "react";

/** GitHub-style submission calendar for the last 52 weeks. */
export default function Heatmap({ data }: { data: Record<string, number> }) {
  const { weeks, months, total, active } = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 7 * 52 - today.getUTCDay());
    const weeks: { key: string; count: number; future: boolean }[][] = [];
    const months: { label: string; col: number }[] = [];
    let total = 0;
    let active = 0;
    const d = new Date(start);
    for (let w = 0; d <= today || w === 0; w++) {
      const col: { key: string; count: number; future: boolean }[] = [];
      for (let i = 0; i < 7; i++) {
        const key = d.toISOString().slice(0, 10);
        const count = data[key] || 0;
        if (d <= today) {
          total += count;
          if (count) active++;
        }
        if (d.getUTCDate() === 1) months.push({ label: d.toLocaleString("en", { month: "short", timeZone: "UTC" }), col: w });
        col.push({ key, count, future: d > today });
        d.setUTCDate(d.getUTCDate() + 1);
      }
      weeks.push(col);
    }
    return { weeks, months, total, active };
  }, [data]);

  const level = (c: number) => (c === 0 ? 0 : c < 2 ? 1 : c < 4 ? 2 : c < 7 ? 3 : 4);
  const colors = ["var(--surface-3)", "color-mix(in srgb, var(--brand) 30%, transparent)", "color-mix(in srgb, var(--brand) 55%, transparent)", "color-mix(in srgb, var(--brand) 80%, transparent)", "var(--brand)"];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 text-sm">
        <span>
          <b>{total}</b> <span className="text-muted">submissions in the past year</span>
        </span>
        <span className="text-muted">
          Active days: <b className="text-text">{active}</b>
        </span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="relative inline-block pt-4">
          <div className="absolute top-0 flex text-[10px] text-faint">
            {months.map((m, i) => (
              <span key={i} className="absolute" style={{ left: m.col * 13 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {w.map((c) => (
                  <div
                    key={c.key}
                    title={`${c.count} submission${c.count === 1 ? "" : "s"} on ${c.key}`}
                    className="size-[10px] rounded-[2px]"
                    style={{ background: c.future ? "transparent" : colors[level(c.count)] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
