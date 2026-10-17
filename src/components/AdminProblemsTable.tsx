"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { safeFetch } from "@/lib/client";
import { useToast } from "@/components/Toast";
import { DifficultyText } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";

type P = { id: string; slug: string; title: string; difficulty: string; status: string; origin: string; collections: string[]; stats: { submissions: number; accepted: number; solvedBy: number } };

export default function AdminProblemsTable({ problems }: { problems: P[] }) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const list = useMemo(() => problems.filter((p) => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase())), [problems, q]);

  async function setStatus(id: string, status: "approved" | "draft") {
    const r = await safeFetch("/api/admin/problems-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const d = await r.json();
    if (!r.ok) return toast(d.error, "error");
    toast(status === "approved" ? "Problem is live" : "Problem hidden from users", "success");
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">
        <input className="input max-w-sm" placeholder="Filter problems…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="text-xs text-muted">
          {problems.filter((p) => p.status === "approved").length} live · {problems.length} total. Official problems are reloaded from <code>content/</code> by <code>npm run seed</code>, so edit those files for permanent changes.
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2">Problem</th>
              <th className="px-4 py-2">Difficulty</th>
              <th className="px-4 py-2">Origin</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Solved by</th>
              <th className="px-4 py-2">Acceptance</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2">
                  <Link href={`/problems/${p.slug}`} className="font-medium hover:text-brand">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <DifficultyText difficulty={p.difficulty} />
                </td>
                <td className="px-4 py-2 text-muted">{p.origin}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-2">{p.stats?.solvedBy || 0}</td>
                <td className="px-4 py-2 text-muted">{p.stats?.submissions ? `${Math.round((p.stats.accepted / p.stats.submissions) * 100)}%` : "—"}</td>
                <td className="whitespace-nowrap px-4 py-2 text-right">
                  <Link href={`/contribute/${p.slug}/edit`} className="btn btn-ghost btn-sm" title="Edit">
                    <Pencil className="size-3.5" />
                  </Link>
                  {p.status === "approved" ? (
                    <button onClick={() => setStatus(p.id, "draft")} className="btn btn-ghost btn-sm" title="Hide from users">
                      <EyeOff className="size-3.5" /> Hide
                    </button>
                  ) : (
                    <button onClick={() => setStatus(p.id, "approved")} className="btn btn-ghost btn-sm !text-brand" title="Publish">
                      <Eye className="size-3.5" /> Publish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
