import Link from "next/link";
import { FilePlus2, Pencil } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Problem } from "@/lib/models/Problem";
import { DifficultyText, EmptyState, timeAgo } from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";

export const metadata = { title: "Contribute" };
export const dynamic = "force-dynamic";

export default async function ContributePage() {
  const me = await getCurrentUser();
  await dbConnect();
  const mine = me ? await Problem.find({ author: me.id }).sort({ updatedAt: -1 }).select("slug title difficulty status reviewNotes checks updatedAt").lean() : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="card flex flex-wrap items-center gap-5 bg-gradient-to-br from-brand-soft/60 to-transparent p-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Contribute a problem</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Faced an interesting question in an Infosys / TCS / Accenture test? Write it up with a reference solution and tests. Automated checks verify
            your solution against every test, then an admin reviews it before it goes live for everyone.
          </p>
        </div>
        {me ? (
          <Link href="/contribute/new" className="btn btn-primary">
            <FilePlus2 className="size-4" /> New problem
          </Link>
        ) : (
          <Link href="/login?callbackUrl=/contribute" className="btn btn-primary">
            Sign in to contribute
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-4">
        {["Write statement + samples", "Add reference solution & hidden tests", "Automated checks run", "Admin approves → live"].map((s, i) => (
          <div key={s} className="card flex items-center gap-3 p-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-fg">{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      {me && (
        <div className="card mt-6 overflow-hidden">
          <h2 className="border-b border-border px-5 py-3 font-semibold">My problems</h2>
          {mine.length === 0 && <EmptyState title="You haven't contributed yet">Your submitted problems and their review status appear here.</EmptyState>}
          {mine.map((p) => {
            const failing = (p.checks || []).filter((c) => !c.ok && c.severity !== "warn");
            return (
              <div key={String(p._id)} className="border-b border-border px-5 py-4 last:border-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/problems/${p.slug}`} className="font-semibold hover:text-brand">
                    {p.title}
                  </Link>
                  <DifficultyText difficulty={p.difficulty} />
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-faint">updated {timeAgo(p.updatedAt)}</span>
                  {p.status !== "approved" && (
                    <Link href={`/contribute/${p.slug}/edit`} className="btn btn-secondary btn-sm ml-auto">
                      <Pencil className="size-3.5" /> Edit
                    </Link>
                  )}
                </div>
                {p.reviewNotes && (
                  <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
                    <b>{p.status === "pending" ? "Previous review note" : "Reviewer"}:</b> {p.reviewNotes}
                  </p>
                )}
                {failing.length > 0 && (
                  <ul className="mt-2 space-y-1 rounded-lg bg-danger-soft/50 px-3 py-2 text-xs text-danger">
                    <li className="font-semibold">Admins can&apos;t approve this until these automated checks pass — click Edit to fix:</li>
                    {failing.map((c) => (
                      <li key={c.name}>
                        ✗ {c.name}: {c.detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
