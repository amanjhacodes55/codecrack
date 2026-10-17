import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Problem } from "@/lib/models/Problem";
import { User } from "@/lib/models/User";
import { Submission } from "@/lib/models/Submission";
import { Discussion } from "@/lib/models/Discussion";
import StatusBadge from "@/components/StatusBadge";
import { DifficultyText, EmptyState, timeAgo } from "@/components/ui";

export const metadata = { title: "Admin" };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "pending" } = await searchParams;
  await dbConnect();
  const dayAgo = new Date(Date.now() - 86400000);
  const [users, problems, subsToday, posts, queue] = await Promise.all([
    User.countDocuments(),
    Problem.countDocuments({ status: "approved" }),
    Submission.countDocuments({ createdAt: { $gte: dayAgo } }),
    Discussion.countDocuments({ deleted: false }),
    Problem.find(status === "all" ? { origin: "community" } : { status, origin: "community" })
      .sort({ updatedAt: -1 })
      .populate("author", "name username")
      .select("slug title difficulty status checks updatedAt author")
      .lean(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Users", users],
          ["Live problems", problems],
          ["Submissions (24h)", subsToday],
          ["Discussions", posts],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <div className="text-xs text-muted">{l}</div>
            <div className="mt-1 text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
          <h2 className="mr-auto font-semibold">Community problems</h2>
          {["pending", "changes_requested", "approved", "rejected", "draft", "all"].map((s) => (
            <Link key={s} href={`/admin?status=${s}`} className={`chip ${status === s ? "!border-brand !text-brand" : ""}`}>
              {s.replace("_", " ")}
            </Link>
          ))}
        </div>
        {queue.length === 0 && <EmptyState title="Nothing here">No community problems with this status.</EmptyState>}
        {queue.map((p) => {
          const errs = (p.checks || []).filter((c) => !c.ok && c.severity !== "warn").length;
          const warns = (p.checks || []).filter((c) => !c.ok && c.severity === "warn").length;
          const author = p.author as unknown as { name: string; username: string } | null;
          return (
            <Link key={String(p._id)} href={`/admin/problems/${p._id}`} className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3 text-sm last:border-0 hover:bg-surface-2">
              <span className="font-semibold">{p.title}</span>
              <DifficultyText difficulty={p.difficulty} />
              <StatusBadge status={p.status} />
              {(p.checks || []).length > 0 && (
                <span className={`text-xs ${errs ? "text-danger" : warns ? "text-warn" : "text-brand"}`}>
                  {errs ? `${errs} failing check${errs > 1 ? "s" : ""}` : warns ? `${warns} warning${warns > 1 ? "s" : ""}` : "all checks pass"}
                </span>
              )}
              <span className="ml-auto text-xs text-muted">
                by @{author?.username} · {timeAgo(p.updatedAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
