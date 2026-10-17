"use client";
import { safeFetch } from "@/lib/client";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { VerdictText, EmptyState, timeAgo } from "@/components/ui";
import Markdown from "@/components/Markdown";

type Row = { id: string; language: string; verdict: string; passed: number; total: number; timeMs: number; memoryKb: number; createdAt: string; assisted: boolean };

export default function SubmissionsTab({
  slug,
  signedIn,
  refreshKey,
  onLoadCode,
}: {
  slug: string;
  signedIn: boolean;
  refreshKey: number;
  onLoadCode: (code: string, language: string) => void;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState<{ code: string; language: string; verdict: string; createdAt: string; failed?: { index: number } } | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    safeFetch(`/api/submissions?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setRows(d.submissions || []));
  }, [slug, signedIn, refreshKey]);

  if (!signedIn) return <EmptyState title="Sign in to see your submissions" />;
  if (!rows)
    return (
      <div className="p-6 text-center">
        <Loader2 className="mx-auto size-5 animate-spin text-muted" />
      </div>
    );
  if (open)
    return (
      <div className="space-y-3 p-5">
        <button onClick={() => setOpen(null)} className="btn btn-ghost btn-sm">
          <ArrowLeft className="size-3.5" /> All submissions
        </button>
        <div className="flex items-center justify-between">
          <VerdictText verdict={open.verdict} className="text-lg" />
          <span className="text-xs text-muted">{timeAgo(open.createdAt)}</span>
        </div>
        <Markdown>{"```" + open.language + "\n" + open.code + "\n```"}</Markdown>
        <button onClick={() => onLoadCode(open.code, open.language)} className="btn btn-secondary btn-sm">
          Load this code into the editor
        </button>
      </div>
    );
  if (!rows.length) return <EmptyState title="No submissions yet">Hit Submit when your code passes the samples.</EmptyState>;

  return (
    <div className="divide-y divide-border">
      {rows.map((s) => (
        <button
          key={s.id}
          onClick={async () => {
            const d = await (await safeFetch(`/api/submissions/${s.id}`)).json();
            setOpen(d.submission);
          }}
          className="grid w-full grid-cols-[1fr_auto] items-center gap-2 px-5 py-3 text-left text-sm hover:bg-surface-2"
        >
          <div>
            <VerdictText verdict={s.verdict} />
            <div className="mt-0.5 text-xs text-muted">
              {timeAgo(s.createdAt)} · {s.language} · {s.passed}/{s.total} tests
              {s.assisted && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 text-medium">
                  <Sparkles className="size-3" /> assisted
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-muted">
            <div>{s.timeMs} ms</div>
            <div>{(s.memoryKb / 1024).toFixed(1)} MB</div>
          </div>
        </button>
      ))}
    </div>
  );
}
