"use client";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Rewind,
  RotateCcw,
  Square,
  CornerDownRight,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import type { TraceResult, TraceStep } from "./types";

type Props = {
  trace: TraceResult;
  index: number;
  setIndex: (i: number) => void;
  breakpoints: Set<number>;
  onStop: () => void;
};

const depth = (s: TraceStep) => s.stack.length;

export default function DebuggerPanel({ trace, index, setIndex, breakpoints, onStop }: Props) {
  const steps = trace.steps;
  const step = steps[index];
  const [frameSel, setFrameSel] = useState<number | null>(null);
  const frameIdx = frameSel ?? (step ? step.stack.length - 1 : 0);
  const frame = step?.stack[Math.min(frameIdx, (step?.stack.length || 1) - 1)];
  const prevStep = index > 0 ? steps[index - 1] : null;
  const prevLocals = useMemo(() => {
    if (!prevStep || !step) return {};
    const pf = prevStep.stack[step.stack.length - 1];
    return pf && pf.func === step.stack[step.stack.length - 1]?.func ? pf.locals : {};
  }, [prevStep, step]);

  const go = (i: number) => {
    setFrameSel(null);
    setIndex(Math.max(0, Math.min(steps.length - 1, i)));
  };
  const find = (from: number, dir: 1 | -1, pred: (s: TraceStep) => boolean) => {
    for (let i = from + dir; i >= 0 && i < steps.length; i += dir) if (pred(steps[i])) return i;
    return dir === 1 ? steps.length - 1 : 0;
  };
  const isLine = (s: TraceStep) => s.event === "line";
  const stepOver = () => step && go(find(index, 1, (s) => isLine(s) && depth(s) <= depth(step)));
  const stepInto = () => go(find(index, 1, (s) => isLine(s) || s.event === "exception"));
  const stepOut = () => step && go(find(index, 1, (s) => isLine(s) && depth(s) < depth(step)));
  const stepBack = () => go(find(index, -1, isLine));
  const cont = () => go(find(index, 1, (s) => (isLine(s) && breakpoints.has(s.line)) || s.event === "exception"));
  const revCont = () => go(find(index, -1, (s) => isLine(s) && breakpoints.has(s.line)));

  const out = trace.stdout.slice(0, step ? step.out : 0);
  const atEnd = index >= steps.length - 1;

  const Btn = ({ onClick, title, children, disabled }: { onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) => (
    <button onClick={onClick} title={title} disabled={disabled} className="btn btn-ghost btn-sm !p-1.5 disabled:opacity-30">
      {children}
    </button>
  );

  if (!steps.length)
    return (
      <div className="space-y-3 p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold text-danger">
          <AlertTriangle className="size-4" /> Program could not start
        </p>
        <pre className="whitespace-pre-wrap rounded-lg bg-code p-3 font-mono text-xs text-danger">{trace.error?.traceback || "No steps recorded."}</pre>
        <button onClick={onStop} className="btn btn-secondary btn-sm">Exit debugger</button>
      </div>
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1">
        <Btn onClick={() => go(0)} title="Restart">
          <RotateCcw className="size-4" />
        </Btn>
        <Btn onClick={revCont} title="Reverse continue (previous breakpoint)" disabled={index === 0}>
          <Rewind className="size-4" />
        </Btn>
        <Btn onClick={stepBack} title="Step back" disabled={index === 0}>
          <ChevronLeft className="size-4" />
        </Btn>
        <Btn onClick={stepOver} title="Step over (F10)" disabled={atEnd}>
          <CornerDownRight className="size-4" />
        </Btn>
        <Btn onClick={stepInto} title="Step into (F11)" disabled={atEnd}>
          <ArrowDownToLine className="size-4" />
        </Btn>
        <Btn onClick={stepOut} title="Step out" disabled={atEnd}>
          <ArrowUpFromLine className="size-4" />
        </Btn>
        <Btn onClick={stepInto} title="Next step" disabled={atEnd}>
          <ChevronRight className="size-4" />
        </Btn>
        <Btn onClick={cont} title="Continue to next breakpoint (F5)" disabled={atEnd}>
          <FastForward className="size-4" />
        </Btn>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={index}
          onChange={(e) => go(Number(e.target.value))}
          className="mx-2 min-w-[80px] flex-1 accent-[var(--brand)]"
        />
        <span className="whitespace-nowrap font-mono text-xs text-muted">
          step {index + 1}/{steps.length}
          {trace.truncated && "+"}
        </span>
        <button onClick={onStop} className="btn btn-ghost btn-sm ml-1 !text-danger">
          <Square className="size-3.5 fill-current" /> Stop
        </button>
      </div>

      {step && (
        <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-3 py-1.5 text-xs">
          <span className="rounded bg-yellow-400/20 px-1.5 py-0.5 font-mono font-semibold text-yellow-600 dark:text-yellow-300">line {step.line}</span>
          <span className="text-muted">
            {step.event === "line" && "about to run this line"}
            {step.event === "call" && `entering ${step.func}()`}
            {step.event === "return" && (
              <>
                returning from {step.func}() → <code className="font-mono text-text">{step.ret?.v}</code>
              </>
            )}
            {step.event === "exception" && <span className="text-danger">exception raised: {step.exc}</span>}
          </span>
          {breakpoints.size === 0 && <span className="ml-auto hidden text-faint sm:inline">Tip: click the gutter to add breakpoints</span>}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-auto md:grid-cols-[1.4fr_0.8fr_1fr] md:overflow-hidden">
        <div className="min-h-0 overflow-auto border-border md:border-r">
          <div className="sticky top-0 bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Variables {frame && <span className="normal-case text-faint">— {frame.func === "<module>" ? "global" : frame.func + "()"}</span>}
          </div>
          <table className="w-full font-mono text-xs">
            <tbody>
              {frame &&
                Object.entries(frame.locals).map(([k, v]) => {
                  const changed = frameIdx === step.stack.length - 1 && prevLocals[k]?.v !== v.v;
                  return (
                    <tr key={k} className={clsx("border-t border-border/60 align-top", changed && "bg-brand-soft/60")}>
                      <td className="w-[30%] px-3 py-1 font-semibold text-info">{k}</td>
                      <td className="px-1 py-1 text-faint">
                        {v.t}
                        {v.n !== undefined && `[${v.n}]`}
                      </td>
                      <td className="break-all px-3 py-1">{v.v}</td>
                    </tr>
                  );
                })}
              {frame && Object.keys(frame.locals).length === 0 && (
                <tr>
                  <td className="px-3 py-2 text-faint">no variables yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="min-h-0 overflow-auto border-border md:border-r">
          <div className="sticky top-0 bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Call stack</div>
          {step?.stack
            .map((f, i) => ({ f, i }))
            .reverse()
            .map(({ f, i }) => (
              <button
                key={i}
                onClick={() => setFrameSel(i)}
                className={clsx(
                  "flex w-full justify-between px-3 py-1 text-left font-mono text-xs hover:bg-surface-2",
                  i === frameIdx && "bg-surface-2 text-brand"
                )}
              >
                <span>{f.func === "<module>" ? "<module>" : f.func + "()"}</span>
                <span className="text-faint">:{f.line}</span>
              </button>
            ))}
        </div>
        <div className="min-h-0 overflow-auto">
          <div className="sticky top-0 bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Output so far</div>
          <pre className="whitespace-pre-wrap break-all px-3 pb-3 font-mono text-xs">{out || <span className="text-faint">(nothing printed yet)</span>}</pre>
          {atEnd && trace.error && (
            <pre className="mx-3 mb-3 whitespace-pre-wrap rounded bg-danger-soft p-2 font-mono text-xs text-danger">{trace.error.traceback}</pre>
          )}
          {atEnd && trace.truncated && (
            <p className="mx-3 mb-3 text-xs text-warn">Stopped after {steps.length} steps — use a smaller input to debug the whole run.</p>
          )}
        </div>
      </div>
    </div>
  );
}
