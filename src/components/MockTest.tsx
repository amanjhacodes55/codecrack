"use client";
import { safeFetch } from "@/lib/client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AlarmClock, ExternalLink, Flag, Play, RefreshCw, Trophy } from "lucide-react";
import { DifficultyText } from "@/components/ui";

type P = { slug: string; title: string; difficulty: string; solved: boolean };
type Mock = { problems: { slug: string; title: string; difficulty: string; weight: number }[]; startedAt: number; minutes: number; ended?: number };
type Best = Record<string, { passed: number; total: number; attempts: number; accepted: boolean }>;

const KEY = "cc-mock";
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

function build(pool: P[], preferUnsolved: boolean) {
  const choose = (pred: (p: P) => boolean, taken: Set<string>) => {
    const all = pool.filter((p) => pred(p) && !taken.has(p.slug));
    const fresh = all.filter((p) => !p.solved);
    return pick(preferUnsolved && fresh.length ? fresh : all);
  };
  const taken = new Set<string>();
  const q1 = choose((p) => p.difficulty === "Easy" || p.difficulty === "Medium", taken);
  if (q1) taken.add(q1.slug);
  const q2 = choose((p) => p.difficulty === "Medium", taken);
  if (q2) taken.add(q2.slug);
  const q3 = choose((p) => p.difficulty === "Hard", taken);
  return [q1, q2, q3].filter(Boolean).map((p, i) => ({ slug: p!.slug, title: p!.title, difficulty: p!.difficulty, weight: [20, 30, 50][i] }));
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function MockTest({ pool, signedIn }: { pool: P[]; signedIn: boolean }) {
  const [mock, setMock] = useState<Mock | null>(null);
  const [now, setNow] = useState(Date.now());
  const [best, setBest] = useState<Best>({});
  const [minutes, setMinutes] = useState(180);
  const [fresh, setFresh] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setMock(JSON.parse(raw));
    } catch {}
  }, []);
  const save = (m: Mock | null) => {
    setMock(m);
    try {
      if (m) localStorage.setItem(KEY, JSON.stringify(m));
      else localStorage.removeItem(KEY);
    } catch {}
  };

  const refresh = useCallback(async () => {
    if (!mock || !signedIn) return;
    const r = await safeFetch(`/api/mock?slugs=${mock.problems.map((p) => p.slug).join(",")}&since=${mock.startedAt}`);
    if (r.ok) setBest((await r.json()).best);
  }, [mock, signedIn]);

  useEffect(() => {
    refresh();
    const t = setInterval(() => setNow(Date.now()), 1000);
    const r = setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(t);
      clearInterval(r);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const endAt = mock ? mock.startedAt + mock.minutes * 60000 : 0;
  const finished = mock && (mock.ended || now >= endAt);
  useEffect(() => {
    if (mock && !mock.ended && now >= endAt) save({ ...mock, ended: endAt });
  }, [now, mock, endAt]);

  const score = mock
    ? mock.problems.reduce((a, p) => {
        const b = best[p.slug];
        return a + (b ? (p.weight * b.passed) / Math.max(1, b.total) : 0);
      }, 0)
    : 0;

  if (!mock)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="card p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft">
              <AlarmClock className="size-6 text-brand" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Infosys-style mock test</h1>
              <p className="text-sm text-muted">3 questions · Easy/Medium, Medium, Hard · partial marks per test case</p>
            </div>
          </div>
          <ul className="mt-6 list-disc space-y-1.5 pl-5 text-sm text-muted">
            <li>Questions are weighted 20 / 30 / 50 marks. Your best submission on each counts, proportional to test cases passed — just like the real exam.</li>
            <li>Don&apos;t open editorials, solutions or videos during the mock. Practise like it&apos;s real: no internet search either.</li>
            <li>Strategy: read all three first (10 min), bank Q1 fast, then get partial marks on Q3 with a brute force before optimising.</li>
          </ul>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Duration</label>
              <select className="input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                <option value={180}>3 hours (real exam)</option>
                <option value={120}>2 hours</option>
                <option value={90}>90 minutes (speed drill)</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={fresh} onChange={(e) => setFresh(e.target.checked)} className="accent-[var(--brand)]" />
              Prefer problems I haven&apos;t solved
            </label>
          </div>
          {!signedIn && <p className="mt-4 rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">Sign in so your submissions can be scored.</p>}
          <button onClick={() => save({ problems: build(pool, fresh), startedAt: Date.now(), minutes })} className="btn btn-primary mt-6 w-full" disabled={!signedIn}>
            <Play className="size-4" /> Start mock test
          </button>
        </div>
      </div>
    );

  const left = endAt - now;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card overflow-hidden">
        <div className={clsx("flex flex-wrap items-center gap-4 p-6", finished ? "bg-surface-2" : left < 15 * 60000 ? "bg-danger-soft" : "bg-brand-soft/50")}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{finished ? "Mock finished" : "Time remaining"}</p>
            <p className={clsx("font-mono text-4xl font-bold", !finished && left < 15 * 60000 && "text-danger")}>{finished ? "00:00:00" : fmt(left)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Score</p>
            <p className="text-4xl font-bold">
              {score.toFixed(1)}
              <span className="text-lg text-muted">/100</span>
            </p>
          </div>
        </div>
        <div>
          {mock.problems.map((p, i) => {
            const b = best[p.slug];
            return (
              <div key={p.slug} className="flex flex-wrap items-center gap-3 border-t border-border px-6 py-4">
                <span className="flex size-8 items-center justify-center rounded-lg bg-surface-3 text-sm font-bold">Q{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-muted">
                    <DifficultyText difficulty={p.difficulty} /> · {p.weight} marks
                    {b && ` · ${b.attempts} submission${b.attempts > 1 ? "s" : ""} · best ${b.passed}/${b.total} tests`}
                  </p>
                </div>
                <span className={clsx("text-sm font-bold", b?.accepted ? "text-brand" : b ? "text-medium" : "text-faint")}>
                  {b ? ((p.weight * b.passed) / Math.max(1, b.total)).toFixed(1) : "0"} / {p.weight}
                </span>
                {!finished && (
                  <Link href={`/problems/${p.slug}`} target="_blank" className="btn btn-secondary btn-sm">
                    Solve <ExternalLink className="size-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border p-4">
          <button onClick={refresh} className="btn btn-ghost btn-sm">
            <RefreshCw className="size-3.5" /> Refresh score
          </button>
          {!finished ? (
            <button onClick={() => confirm("End the mock test now?") && save({ ...mock, ended: Date.now() })} className="btn btn-secondary btn-sm ml-auto">
              <Flag className="size-3.5" /> End test
            </button>
          ) : (
            <button onClick={() => save(null)} className="btn btn-primary btn-sm ml-auto">
              <Trophy className="size-3.5" /> New mock test
            </button>
          )}
        </div>
      </div>
      {finished && (
        <div className="card mt-5 p-5 text-sm">
          <p className="font-semibold">
            {score >= 70 ? "Excellent — that's SP territory. 🎯" : score >= 45 ? "Solid — keep pushing on the Hard slot." : "Keep going — focus on banking Q1/Q2 and partial marks on Q3."}
          </p>
          <p className="mt-1 text-muted">Now open the editorials of the problems you missed and add a one-line note in the Notes tab for revision.</p>
        </div>
      )}
    </div>
  );
}
