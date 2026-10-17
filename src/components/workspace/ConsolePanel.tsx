"use client";
import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bug, CheckCircle2, Loader2, Plus, XCircle, PartyPopper, Sparkles, Clock, Cpu } from "lucide-react";
import { IOBlock } from "@/components/CodeBlock";
import { VERDICT_NAME, type RunResponse, type Sample, type SubmitResponse } from "./types";

export type ConsoleTab = "testcases" | "result" | "debugger";

type Props = {
  tab: ConsoleTab;
  setTab: (t: ConsoleTab) => void;
  samples: Sample[];
  selected: number; // index in samples, or -1 for custom
  setSelected: (i: number) => void;
  customInput: string;
  setCustomInput: (s: string) => void;
  busy: "run" | "submit" | "debug" | null;
  run: RunResponse | null;
  submit: SubmitResponse | null;
  debugging: boolean;
  debuggerNode: React.ReactNode;
  onDebugInput: (input: string) => void;
  nextSlug?: string | null;
};

function Chip({ active, ok, children, onClick }: { active: boolean; ok?: boolean | null; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        active ? "bg-surface-3 text-text" : "text-muted hover:bg-surface-2"
      )}
    >
      {ok === true && <span className="size-1.5 rounded-full bg-brand" />}
      {ok === false && <span className="size-1.5 rounded-full bg-danger" />}
      {children}
    </button>
  );
}

export default function ConsolePanel(p: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex items-center gap-1 border-b border-border px-2">
        {(["testcases", "result"] as const).map((t) => (
          <button key={t} onClick={() => p.setTab(t)} className={clsx("relative px-3 py-2 text-sm font-medium", p.tab === t ? "text-text" : "text-muted hover:text-text")}>
            {t === "testcases" ? "Testcases" : "Test Result"}
            {p.tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
          </button>
        ))}
        {p.debugging && (
          <button
            onClick={() => p.setTab("debugger")}
            className={clsx("relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium", p.tab === "debugger" ? "text-text" : "text-muted hover:text-text")}
          >
            <Bug className="size-3.5 text-yellow-500" /> Debugger
            {p.tab === "debugger" && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-yellow-500" />}
          </button>
        )}
        {p.busy && (
          <span className="ml-auto flex items-center gap-1.5 pr-2 text-xs text-muted">
            <Loader2 className="size-3.5 animate-spin" />
            {p.busy === "submit" ? "Judging against all test cases…" : p.busy === "debug" ? "Recording execution…" : "Running…"}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {p.tab === "testcases" && <TestcasesView {...p} />}
        {p.tab === "result" && <ResultView {...p} />}
        {p.tab === "debugger" && p.debuggerNode}
      </div>
    </div>
  );
}

function TestcasesView(p: Props) {
  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap gap-1">
        {p.samples.map((_, i) => (
          <Chip key={i} active={p.selected === i} onClick={() => p.setSelected(i)}>
            Case {i + 1}
          </Chip>
        ))}
        <Chip active={p.selected === -1} onClick={() => p.setSelected(-1)}>
          <Plus className="size-3" /> Custom input
        </Chip>
      </div>
      {p.selected >= 0 && p.samples[p.selected] ? (
        <div className="grid gap-3 md:grid-cols-2">
          <IOBlock label="Input" text={p.samples[p.selected].input.replace(/\n$/, "")} />
          <IOBlock label="Expected output" text={p.samples[p.selected].output.replace(/\n$/, "")} />
        </div>
      ) : (
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
            <span>Custom input (stdin)</span>
            <span className="font-normal text-faint">Expected output is computed with the reference solution</span>
          </div>
          <textarea
            value={p.customInput}
            onChange={(e) => p.setCustomInput(e.target.value)}
            spellCheck={false}
            className="input min-h-[110px] resize-y font-mono text-[13px]"
            placeholder="Type your own input here, exactly as stdin would receive it…"
          />
        </div>
      )}
      <p className="text-xs text-faint">
        <b>Run</b> (Ctrl+&apos;) checks the selected cases · <b>Submit</b> (Ctrl+Enter) judges all hidden tests · <b>Debug</b> steps through the selected input line by line.
      </p>
    </div>
  );
}

function ResultView(p: Props) {
  if (p.busy && p.busy !== "debug")
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" /> {p.busy === "submit" ? "Judging…" : "Running…"}
      </div>
    );
  if (p.submit) return <SubmitView s={p.submit} onDebugInput={p.onDebugInput} nextSlug={p.nextSlug} />;
  if (p.run) return <RunView r={p.run} onDebugInput={p.onDebugInput} />;
  return <div className="p-6 text-center text-sm text-muted">Run your code to see results here.</div>;
}


function RunView({ r, onDebugInput }: { r: RunResponse; onDebugInput: (i: string) => void }) {
  const [sel, setSel] = useState(0);
  if (!r.compile.ok)
    return (
      <div className="space-y-2 p-3">
        <h3 className="text-lg font-bold text-warn">Compilation Error</h3>
        <pre className="whitespace-pre-wrap rounded-lg bg-danger-soft p-3 font-mono text-xs text-danger">{r.compile.message}</pre>
      </div>
    );
  const graded = r.results.filter((x) => x.expected !== null);
  const allOk = graded.length > 0 && graded.every((x) => x.verdict === "AC");
  const bad = r.results.find((x) => !["AC", "OK"].includes(x.verdict));
  const cur = r.results[Math.min(sel, r.results.length - 1)];
  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center gap-3">
        {bad ? (
          <h3 className="text-lg font-bold text-danger">{VERDICT_NAME[bad.verdict]}</h3>
        ) : allOk ? (
          <h3 className="text-lg font-bold text-brand">{r.custom ? "Output matches" : "Accepted"}</h3>
        ) : (
          <h3 className="text-lg font-bold">Finished</h3>
        )}
        <span className="text-xs text-muted">Runtime: {Math.max(...r.results.map((x) => x.timeMs))} ms</span>
      </div>
      {r.results.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {r.results.map((x, i) => (
            <Chip key={i} active={sel === i} ok={x.verdict === "AC" ? true : x.verdict === "OK" ? null : false} onClick={() => setSel(i)}>
              Case {i + 1}
            </Chip>
          ))}
        </div>
      )}
      {cur && (
        <div className="space-y-3">
          <IOBlock label="Input" text={cur.input.replace(/\n$/, "")} />
          <div className="grid gap-3 md:grid-cols-2">
            <IOBlock label="Your output" text={cur.stdout.replace(/\n$/, "")} tone={cur.verdict === "AC" ? "ok" : cur.expected !== null ? "bad" : undefined} />
            {cur.expected !== null && <IOBlock label="Expected output" text={cur.expected.replace(/\n$/, "")} />}
          </div>
          {cur.stderr && <IOBlock label={cur.verdict === "RE" ? "Error" : "stderr / debug prints"} text={cur.stderr} tone="bad" />}
          {cur.verdict !== "AC" && (
            <button onClick={() => onDebugInput(cur.input)} className="btn btn-secondary btn-sm">
              <Bug className="size-3.5 text-yellow-500" /> Debug with this input
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SubmitView({ s, onDebugInput, nextSlug }: { s: SubmitResponse; onDebugInput: (i: string) => void; nextSlug?: string | null }) {
  const ok = s.verdict === "Accepted";
  return (
    <div className="animate-pop space-y-4 p-4">
      <div className={clsx("rounded-xl border p-4", ok ? "border-brand/40 bg-brand-soft/60" : "border-danger/30 bg-danger-soft/50")}>
        <div className="flex flex-wrap items-center gap-3">
          {ok ? <CheckCircle2 className="size-7 text-brand" /> : <XCircle className="size-7 text-danger" />}
          <div>
            <h3 className={clsx("text-xl font-bold", ok ? "text-brand" : s.verdict === "Compilation Error" ? "text-warn" : "text-danger")}>{s.verdict}</h3>
            <p className="text-sm text-muted">
              {s.passed} / {s.total} test cases passed
            </p>
          </div>
          {ok && s.firstSolve && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-fg">
              <PartyPopper className="size-3.5" /> First solve!
            </span>
          )}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
          <div className={clsx("h-full rounded-full", ok ? "bg-brand" : "bg-danger")} style={{ width: `${(s.passed / Math.max(1, s.total)) * 100}%` }} />
        </div>
        {s.verdict !== "Compilation Error" && (
          <div className="mt-3 flex gap-5 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-muted" /> {s.timeMs} ms
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu className="size-4 text-muted" /> {(s.memoryKb / 1024).toFixed(1)} MB
            </span>
          </div>
        )}
        {ok && (
          <div className="mt-4 flex flex-wrap gap-2">
            {nextSlug && (
              <Link href={`/problems/${nextSlug}`} className="btn btn-primary btn-sm">
                Next problem <ArrowRight className="size-3.5" />
              </Link>
            )}
            <Link href="/tracks/crack-infosys-sp-dse" className="btn btn-secondary btn-sm">
              Back to my track
            </Link>
          </div>
        )}
        {ok && s.assisted && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-medium">
            <Sparkles className="size-3.5" /> Marked as assisted because you revealed the editorial/solution. Re-solve it from scratch in a few days!
          </p>
        )}
      </div>

      {s.compileError && <pre className="whitespace-pre-wrap rounded-lg bg-danger-soft p-3 font-mono text-xs text-danger">{s.compileError}</pre>}

      {s.failed && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            Failed on {s.failed.sample ? "sample" : "hidden"} test #{s.failed.index}
          </h4>
          <IOBlock label="Input" text={s.failed.input.replace(/\n$/, "")} />
          <div className="grid gap-3 md:grid-cols-2">
            <IOBlock label="Your output" text={s.failed.output.replace(/\n$/, "")} tone="bad" />
            <IOBlock label="Expected output" text={s.failed.expected.replace(/\n$/, "")} tone="ok" />
          </div>
          {s.failed.stderr && <IOBlock label="Error" text={s.failed.stderr} tone="bad" />}
          {s.failed.input.length < 3000 && !s.failed.input.includes("more characters") && (
            <button onClick={() => onDebugInput(s.failed!.input)} className="btn btn-secondary btn-sm">
              <Bug className="size-3.5 text-yellow-500" /> Debug this failing test
            </button>
          )}
        </div>
      )}
    </div>
  );
}
