"use client";
import { useState } from "react";
import clsx from "clsx";
import Markdown from "@/components/Markdown";

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeight = 140,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-border focus-within:border-brand">
      <div className="flex items-center gap-1 border-b border-border bg-surface-2 px-2 py-1 text-xs">
        {["Write", "Preview"].map((t, i) => (
          <button
            type="button"
            key={t}
            onClick={() => setPreview(i === 1)}
            className={clsx("rounded px-2 py-1 font-medium", preview === (i === 1) ? "bg-surface text-text" : "text-muted")}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-faint">Markdown + ```python code blocks supported</span>
      </div>
      {preview ? (
        <div className="bg-surface p-3" style={{ minHeight }}>
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-faint">Nothing to preview.</p>}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full resize-y bg-surface p-3 font-mono text-[13px] outline-none placeholder:text-faint"
          style={{ minHeight }}
        />
      )}
    </div>
  );
}
