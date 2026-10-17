import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Submission } from "@/lib/models/Submission";
import { Problem } from "@/lib/models/Problem";
import { EmptyState, VerdictText, timeAgo } from "@/components/ui";

export const metadata = { title: "My submissions" };
export const dynamic = "force-dynamic";

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ verdict?: string }> }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login?callbackUrl=/submissions");
  const { verdict } = await searchParams;
  await dbConnect();
  const q: Record<string, unknown> = { user: me.id };
  if (verdict) q.verdict = verdict;
  const subs = await Submission.find(q).sort({ createdAt: -1 }).limit(200).select("slug language verdict passed total timeMs memoryKb createdAt assisted").lean();
  const titles = new Map((await Problem.find({ slug: { $in: [...new Set(subs.map((s) => s.slug))] } }).select("slug title").lean()).map((p) => [p.slug, p.title]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">My submissions</h1>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {["", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error"].map((v) => (
            <Link key={v} href={v ? `/submissions?verdict=${encodeURIComponent(v)}` : "/submissions"} className={`chip ${(verdict || "") === v ? "!border-brand !text-brand" : ""}`}>
              {v || "All"}
            </Link>
          ))}
        </div>
      </div>
      <div className="card mt-6 overflow-hidden">
        {subs.length === 0 && <EmptyState title="No submissions yet" />}
        {subs.map((s) => (
          <Link
            key={String(s._id)}
            href={`/problems/${s.slug}`}
            className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-5 py-3 text-sm last:border-0 hover:bg-surface-2 sm:grid-cols-[1fr_170px_90px_90px_90px]"
          >
            <span className="truncate font-medium">
              {titles.get(s.slug) || s.slug}
              {s.assisted && <Sparkles className="ml-1 inline size-3 text-medium" />}
            </span>
            <VerdictText verdict={s.verdict} />
            <span className="hidden text-muted sm:block">
              {s.passed}/{s.total}
            </span>
            <span className="hidden text-muted sm:block">{s.timeMs} ms</span>
            <span className="hidden text-right text-xs text-faint sm:block">{timeAgo(s.createdAt)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
