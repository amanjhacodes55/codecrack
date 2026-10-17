import Link from "next/link";
import clsx from "clsx";
import { Crown, Medal } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/lib/models/User";
import { leaderboard, POINTS } from "@/lib/stats";
import { Avatar, EmptyState } from "@/components/ui";

export const metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  await dbConnect();
  const me = await getCurrentUser();
  const days = range === "week" ? 7 : range === "month" ? 30 : undefined;
  const rows = (await leaderboard(days)).slice(0, 100);
  const users = await User.find({ _id: { $in: rows.map((r) => r.user) }, banned: false }).select("name username image college").lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted">
            Easy {POINTS.Easy} · Medium {POINTS.Medium} · Hard {POINTS.Hard} points per first solve. Solves after revealing the solution count half.
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-0.5 text-sm">
          {[
            ["", "All time"],
            ["month", "30 days"],
            ["week", "7 days"],
          ].map(([v, l]) => (
            <Link key={v} href={v ? `/leaderboard?range=${v}` : "/leaderboard"} className={clsx("rounded-md px-3 py-1.5 font-medium", (range || "") === v ? "bg-surface-3" : "text-muted")}>
              {l}
            </Link>
          ))}
        </div>
      </div>
      <div className="card mt-6 overflow-hidden">
        {rows.length === 0 && <EmptyState title="No solves yet in this period">Be the first on the board!</EmptyState>}
        {rows.map((r, i) => {
          const u = byId.get(r.user);
          if (!u) return null;
          return (
            <Link
              key={r.user}
              href={`/u/${u.username}`}
              className={clsx("flex items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-surface-2", me?.id === r.user && "bg-brand-soft/40")}
            >
              <span className="w-8 text-center font-bold text-muted">
                {i === 0 ? <Crown className="mx-auto size-5 text-medium" /> : i < 3 ? <Medal className={clsx("mx-auto size-5", i === 1 ? "text-faint" : "text-orange-500")} /> : i + 1}
              </span>
              <Avatar name={u.name} image={u.image} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{u.name}</p>
                <p className="truncate text-xs text-muted">
                  @{u.username}
                  {u.college ? ` · ${u.college}` : ""}
                </p>
              </div>
              <div className="hidden gap-3 text-xs sm:flex">
                <span className="text-easy">{r.counts.Easy} E</span>
                <span className="text-medium">{r.counts.Medium} M</span>
                <span className="text-hard">{r.counts.Hard} H</span>
              </div>
              <span className="w-16 text-right text-lg font-bold">{r.score}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
