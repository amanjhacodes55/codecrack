"use client";
import { safeFetch } from "@/lib/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { timeAgo } from "@/components/ui";

type Check = { name: string; ok: boolean; detail: string; severity?: string };
const COLLECTIONS = ["infosys-sp-dse", "infosys-easy-medium", "hackwithinfy", "infytq", "fundamentals", "hashing-drill"];

export default function ReviewPanel(props: {
  id: string;
  status: string;
  difficulty: string;
  collections: string[];
  checks: Check[];
  checkedAt: string | null;
  notes: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [checks, setChecks] = useState(props.checks);
  const [checkedAt, setCheckedAt] = useState(props.checkedAt);
  const [busy, setBusy] = useState("");
  const [notes, setNotes] = useState(props.notes);
  const [difficulty, setDifficulty] = useState(props.difficulty);
  const [collections, setCollections] = useState<string[]>(props.collections);
  const blocking = checks.filter((c) => !c.ok && c.severity !== "warn");

  async function rerun() {
    setBusy("check");
    const r = await safeFetch(`/api/admin/problems/${props.id}/check`, { method: "POST" });
    const d = await r.json();
    setBusy("");
    if (!r.ok) return toast(d.error, "error");
    setChecks(d.checks);
    setCheckedAt(d.checkedAt);
  }

  async function review(action: string) {
    if ((action === "reject" || action === "changes") && !notes.trim()) return toast("Write a note for the author explaining why.", "error");
    setBusy(action);
    const r = await safeFetch(`/api/admin/problems/${props.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes, difficulty, collections }),
    });
    const d = await r.json();
    setBusy("");
    if (d.checks) setChecks(d.checks);
    if (!r.ok) return toast(d.error, "error");
    toast(`Problem ${d.status.replace("_", " ")}`, "success");
    router.refresh();
  }

  return (
    <div className="sticky top-20 space-y-4">
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Automated checks</h3>
          <button onClick={rerun} disabled={!!busy} className="btn btn-secondary btn-sm">
            {busy === "check" ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Re-run
          </button>
        </div>
        {checks.length === 0 && <p className="text-sm text-muted">Not run yet — click Re-run.</p>}
        <ul className="space-y-2.5">
          {checks.map((c) => (
            <li key={c.name} className="flex gap-2 text-sm">
              {c.ok ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
              ) : c.severity === "warn" ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />
              )}
              <div className="min-w-0">
                <p className="font-medium">{c.name}</p>
                <p className={clsx("whitespace-pre-wrap break-words text-xs", c.ok ? "text-muted" : c.severity === "warn" ? "text-warn" : "text-danger")}>{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
        {checkedAt && <p className="mt-3 text-xs text-faint">Last run {timeAgo(checkedAt)}</p>}
      </div>

      <div className="card space-y-3 p-5">
        <h3 className="font-semibold">Decision</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Collections</label>
          <div className="flex flex-wrap gap-1.5">
            {COLLECTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCollections((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]))}
                className={clsx("chip", collections.includes(c) && "!border-brand !text-brand")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Note to author</label>
          <textarea className="input min-h-[90px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Required when rejecting or requesting changes" />
        </div>
        <button onClick={() => review("approve")} disabled={!!busy || blocking.length > 0} className="btn btn-primary w-full" title={blocking.length ? "Fix failing checks first" : ""}>
          {busy === "approve" && <Loader2 className="size-4 animate-spin" />} Approve &amp; publish
        </button>
        {blocking.length > 0 && <p className="text-xs text-danger">{blocking.length} blocking check(s) failing — approval is disabled.</p>}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => review("changes")} disabled={!!busy} className="btn btn-secondary">
            Request changes
          </button>
          <button onClick={() => review("reject")} disabled={!!busy} className="btn btn-danger">
            Reject
          </button>
        </div>
        {props.status === "approved" && (
          <button onClick={() => review("unpublish")} disabled={!!busy} className="btn btn-ghost w-full">
            Unpublish (back to pending)
          </button>
        )}
      </div>
    </div>
  );
}
