import Link from "next/link";
import { CheckCircle2, CircleDashed, Shuffle, Bookmark, Building2 } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Problem } from "@/lib/models/Problem";
import { User } from "@/lib/models/User";
import { Track } from "@/lib/models/Track";
import { userProgress } from "@/lib/problems";
import { DifficultyText, EmptyState } from "@/components/ui";
import ProblemFilters from "@/components/ProblemFilters";
import ProgressRing from "@/components/ProgressRing";

export const metadata = { title: "Problems" };
export const dynamic = "force-dynamic";

const COLLECTION_LABELS: Record<string, string> = {
  "infosys-sp-dse": "Infosys SP / DSE",
  "infosys-easy-medium": "Infosys Easy–Medium",
  hackwithinfy: "HackWithInfy",
  infytq: "InfyTQ",
  fundamentals: "Fundamentals",
  "hashing-drill": "Hashing Drill",
};

type SP = Record<string, string | undefined>;

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  await dbConnect();
  const user = await getCurrentUser();
  const [all, progress, me, tracks] = await Promise.all([
    Problem.find({ status: "approved" })
      .select("slug title difficulty tags companies collections stats order origin")
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    userProgress(user?.id),
    user ? User.findById(user.id).select("bookmarks").lean() : null,
    Track.find().select("slug title").sort({ order: 1 }).lean(),
  ]);
  const bookmarks = new Set((me?.bookmarks || []).map(String));

  const q = (sp.q || "").toLowerCase().trim();
  let list = all.filter((p) => {
    const id = String(p._id);
    if (q && !p.title.toLowerCase().includes(q) && !p.tags.some((t) => t.toLowerCase().includes(q))) return false;
    if (sp.difficulty && p.difficulty !== sp.difficulty) return false;
    if (sp.tag && !p.tags.includes(sp.tag)) return false;
    if (sp.company && !p.companies.includes(sp.company)) return false;
    if (sp.collection && !p.collections.includes(sp.collection)) return false;
    if (sp.origin && p.origin !== sp.origin) return false;
    if (sp.status === "solved" && !progress.solved.has(id)) return false;
    if (sp.status === "attempted" && !progress.attempted.has(id)) return false;
    if (sp.status === "todo" && (progress.solved.has(id) || progress.attempted.has(id))) return false;
    if (sp.status === "bookmarked" && !bookmarks.has(id)) return false;
    return true;
  });
  const acc = (p: (typeof all)[number]) => (p.stats?.submissions ? p.stats.accepted / p.stats.submissions : 0);
  const rank = { Easy: 0, Medium: 1, Hard: 2 } as Record<string, number>;
  if (sp.sort === "difficulty") list = [...list].sort((a, b) => rank[a.difficulty] - rank[b.difficulty]);
  if (sp.sort === "acceptance") list = [...list].sort((a, b) => acc(b) - acc(a));
  if (sp.sort === "popular") list = [...list].sort((a, b) => (b.stats?.solvedBy || 0) - (a.stats?.solvedBy || 0));

  const tagCounts = new Map<string, number>();
  const companyCounts = new Map<string, number>();
  for (const p of all) {
    p.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1));
    p.companies.forEach((c) => companyCounts.set(c, (companyCounts.get(c) || 0) + 1));
  }
  const byDiff = (d: string) => ({
    total: all.filter((p) => p.difficulty === d).length,
    solved: all.filter((p) => p.difficulty === d && progress.solved.has(String(p._id))).length,
  });
  const unsolved = list.filter((p) => !progress.solved.has(String(p._id)));
  const random = unsolved.length ? unsolved[Math.floor(Math.random() * unsolved.length)] : null;
  const collections = [...new Set(all.flatMap((p) => p.collections))];
  const qs = (patch: SP) => {
    const u = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/problems?${u}`;
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <section className="min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Problems</h1>
            <p className="mt-1 text-sm text-muted">
              {all.length} problems · stdin/stdout format exactly like the Infosys &amp; HackerRank judges
            </p>
          </div>
          {random && (
            <Link href={`/problems/${random.slug}`} className="btn btn-secondary btn-sm">
              <Shuffle className="size-3.5" /> Pick one for me
            </Link>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link href={qs({ collection: undefined })} className={`chip !py-1 ${!sp.collection ? "!border-brand !text-brand" : ""}`}>
            All
          </Link>
          {collections.map((c) => (
            <Link key={c} href={qs({ collection: c })} className={`chip !py-1 ${sp.collection === c ? "!border-brand !text-brand" : ""}`}>
              {COLLECTION_LABELS[c] || c}
            </Link>
          ))}
        </div>

        <ProblemFilters tags={[...tagCounts.keys()].sort()} companies={[...companyCounts.keys()].sort()} signedIn={!!user} />

        <div className="card mt-4 overflow-hidden">
          <div className="hidden grid-cols-[44px_1fr_190px_90px_90px] gap-2 border-b border-border bg-surface-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted md:grid">
            <span>Status</span>
            <span>Title</span>
            <span>Topics</span>
            <span>Difficulty</span>
            <span className="text-right">Acceptance</span>
          </div>
          {list.length === 0 && <EmptyState title="No problems match these filters">Try clearing a filter or searching something else.</EmptyState>}
          {list.map((p, i) => {
            const id = String(p._id);
            const solved = progress.solved.has(id);
            const tried = progress.attempted.has(id);
            const a = p.stats?.submissions ? Math.round((p.stats.accepted / p.stats.submissions) * 100) : null;
            return (
              <Link
                key={id}
                href={`/problems/${p.slug}`}
                className={`grid grid-cols-[32px_1fr_auto] items-center gap-2 border-b border-border px-4 py-3 text-sm last:border-0 hover:bg-surface-2 md:grid-cols-[44px_1fr_190px_90px_90px] ${i % 2 ? "bg-surface-2/40" : ""}`}
              >
                <span title={solved ? "Solved" : tried ? "Attempted" : "Not attempted"}>
                  {solved ? (
                    <CheckCircle2 className="size-[18px] text-brand" />
                  ) : tried ? (
                    <CircleDashed className="size-[18px] text-medium" />
                  ) : (
                    <span className="block size-[18px]" />
                  )}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{p.title}</span>
                  {bookmarks.has(id) && <Bookmark className="size-3.5 shrink-0 fill-medium text-medium" />}
                  {p.companies.includes("Infosys") && (
                    <span className="hidden shrink-0 items-center gap-1 rounded bg-info-soft px-1.5 py-0.5 text-[10px] font-semibold text-info sm:inline-flex">
                      <Building2 className="size-3" /> Infosys
                    </span>
                  )}
                  {p.origin === "community" && <span className="chip !text-[10px]">community</span>}
                </span>
                <span className="hidden truncate text-xs text-muted md:block">{p.tags.slice(0, 2).join(" · ")}</span>
                <span className="md:block">
                  <DifficultyText difficulty={p.difficulty} />
                </span>
                <span className="hidden text-right text-muted md:block">{a === null ? "—" : `${a}%`}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <aside className="space-y-5">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold">Your progress</h2>
          {user ? (
            <div className="flex items-center gap-5">
              <ProgressRing value={progress.solved.size} total={all.length} />
              <div className="flex-1 space-y-2 text-sm">
                {(["Easy", "Medium", "Hard"] as const).map((d) => {
                  const s = byDiff(d);
                  return (
                    <div key={d}>
                      <div className="flex justify-between">
                        <DifficultyText difficulty={d} />
                        <span className="text-muted">
                          {s.solved}/{s.total}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <div
                          className={`h-full rounded-full ${d === "Easy" ? "bg-easy" : d === "Medium" ? "bg-medium" : "bg-hard"}`}
                          style={{ width: `${s.total ? (s.solved / s.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              <Link href="/login" className="font-semibold text-brand">
                Sign in
              </Link>{" "}
              to track solved problems and streaks.
            </p>
          )}
        </div>

        {tracks.length > 0 && (
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold">Step-by-step tracks</h2>
            <div className="space-y-2">
              {tracks.map((t) => (
                <Link key={t.slug} href={`/tracks/${t.slug}`} className="block rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:border-brand hover:text-brand">
                  {t.title} →
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Topics</h2>
          <div className="flex flex-wrap gap-1.5">
            {[...tagCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => (
                <Link key={t} href={qs({ tag: sp.tag === t ? undefined : t })} className={`chip hover:text-text ${sp.tag === t ? "!border-brand !text-brand" : ""}`}>
                  {t} <span className="text-faint">{n}</span>
                </Link>
              ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
