"use client";
import { useState } from "react";
import { Bookmark, Building2, CheckCircle2, ChevronDown, Lightbulb, Timer, Users, Cpu } from "lucide-react";
import Markdown from "@/components/Markdown";
import { DifficultyBadge } from "@/components/ui";
import { IOBlock } from "@/components/CodeBlock";
import type { ProblemData } from "./types";

export default function DescriptionTab({
  problem,
  solved,
  bookmarked,
  onBookmark,
}: {
  problem: ProblemData;
  solved: boolean;
  bookmarked: boolean;
  onBookmark: () => void;
}) {
  const [hintsShown, setHintsShown] = useState(0);
  const acc = problem.stats.submissions ? Math.round((problem.stats.accepted / problem.stats.submissions) * 100) : null;

  return (
    <div className="space-y-6 p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold leading-tight">{problem.title}</h1>
          <button onClick={onBookmark} className="btn btn-ghost btn-sm !p-1.5" title={bookmarked ? "Remove bookmark" : "Bookmark"}>
            <Bookmark className={`size-4 ${bookmarked ? "fill-medium text-medium" : ""}`} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <DifficultyBadge difficulty={problem.difficulty} />
          {solved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-semibold text-brand">
              <CheckCircle2 className="size-3.5" /> Solved
            </span>
          )}
          {problem.companies.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 font-semibold text-info">
              <Building2 className="size-3" /> {c}
            </span>
          ))}
          {problem.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Timer className="size-3.5" /> {problem.timeLimitMs / 1000}s per test
          </span>
          <span className="inline-flex items-center gap-1">
            <Cpu className="size-3.5" /> {problem.memoryMb} MB
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {problem.stats.solvedBy} solved
          </span>
          {acc !== null && <span>Acceptance {acc}%</span>}
        </div>
        {problem.source && <p className="mt-2 text-xs italic text-faint">Source: {problem.source}</p>}
        {problem.status !== "approved" && (
          <p className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-xs font-medium text-warn">
            Preview — this problem is {problem.status.replace("_", " ")} and only visible to you and admins.
          </p>
        )}
      </div>

      <Markdown>{problem.statement}</Markdown>

      {problem.inputFormat && (
        <section>
          <h3 className="mb-2 text-sm font-bold">Input Format</h3>
          <Markdown>{problem.inputFormat}</Markdown>
        </section>
      )}
      {problem.outputFormat && (
        <section>
          <h3 className="mb-2 text-sm font-bold">Output Format</h3>
          <Markdown>{problem.outputFormat}</Markdown>
        </section>
      )}
      {problem.constraints && (
        <section>
          <h3 className="mb-2 text-sm font-bold">Constraints</h3>
          <Markdown>{problem.constraints}</Markdown>
        </section>
      )}

      {problem.samples.map((s, i) => (
        <section key={i} className="space-y-2">
          <h3 className="text-sm font-bold">Sample {i + 1}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <IOBlock label="Input" text={s.input.replace(/\n$/, "")} />
            <IOBlock label="Output" text={s.output.replace(/\n$/, "")} />
          </div>
          {s.explanation && (
            <div className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
              <span className="font-semibold">Explanation: </span>
              <Markdown className="inline [&>*]:inline">{s.explanation}</Markdown>
            </div>
          )}
        </section>
      ))}

      {problem.hints.length > 0 && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            <Lightbulb className="size-4 text-medium" /> Hints
          </h3>
          {problem.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="animate-pop rounded-lg border border-medium/30 bg-warn-soft/50 px-3 py-2 text-sm">
              <span className="mr-1 font-semibold text-medium">Hint {i + 1}.</span>
              <Markdown className="inline [&>*]:inline">{h}</Markdown>
            </div>
          ))}
          {hintsShown < problem.hints.length && (
            <button onClick={() => setHintsShown((n) => n + 1)} className="btn btn-secondary btn-sm">
              <ChevronDown className="size-3.5" />
              Reveal hint {hintsShown + 1} of {problem.hints.length}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
