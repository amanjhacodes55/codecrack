"use client";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className={clsx("rounded p-1 text-faint hover:bg-surface-3 hover:text-text", className)}
      title="Copy"
    >
      {done ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
    </button>
  );
}

/** Plain monospace block for sample I/O and program output (keeps whitespace exactly). */
export function IOBlock({ label, text, tone }: { label?: string; text: string; tone?: "ok" | "bad" }) {
  return (
    <div>
      {label && <div className="mb-1 text-xs font-semibold text-muted">{label}</div>}
      <div
        className={clsx(
          "group relative rounded-lg border bg-code px-3 py-2 font-mono text-[13px] leading-relaxed",
          tone === "ok" ? "border-brand/40" : tone === "bad" ? "border-danger/50" : "border-border"
        )}
      >
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all">{text === "" ? <span className="text-faint">(empty)</span> : text}</pre>
        <CopyButton text={text} className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  );
}
