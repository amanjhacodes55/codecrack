import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Building2, Calendar, Flame, Github, Globe, Linkedin, MapPin, School, Sparkles, Target, Trophy } from "lucide-react";
import clsx from "clsx";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/lib/models/User";
import { Discussion } from "@/lib/models/Discussion";
import { userStats } from "@/lib/stats";
import { Avatar, DifficultyText, timeAgo } from "@/components/ui";
import Heatmap from "@/components/Heatmap";
import ProgressRing from "@/components/ProgressRing";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  return { title: `@${(await params).username}` };
}

const ext = (u: string) => (u.startsWith("http") ? u : `https://${u}`);

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  await dbConnect();
  const u = await User.findOne({ username: username.toLowerCase() }).lean();
  if (!u || u.banned) notFound();
  const me = await getCurrentUser();
  const isMe = me?.id === String(u._id);
  const [s, posts] = await Promise.all([
    userStats(String(u._id)),
    Discussion.find({ author: u._id, deleted: false }).sort({ createdAt: -1 }).limit(5).select("title score commentCount createdAt").lean(),
  ]);
  const daysLeft = u.targetDate ? Math.ceil((new Date(u.targetDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-5">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <Avatar name={u.name} image={u.image} size={72} />
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold">{u.name}</h1>
              <p className="text-sm text-muted">@{u.username}</p>
              {u.role === "admin" && <span className="chip mt-1 !border-brand/40 !text-brand">Admin</span>}
            </div>
          </div>
          {u.bio && <p className="mt-4 text-sm">{u.bio}</p>}
          {isMe && (
            <Link href="/settings" className="btn btn-secondary btn-sm mt-4 w-full">
              Edit profile
            </Link>
          )}
          <div className="mt-4 space-y-2 text-sm text-muted">
            {u.college && (
              <p className="flex items-center gap-2">
                <School className="size-4" /> {u.college}
              </p>
            )}
            {u.location && (
              <p className="flex items-center gap-2">
                <MapPin className="size-4" /> {u.location}
              </p>
            )}
            {u.github && (
              <a href={ext(u.github)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-text">
                <Github className="size-4" /> {u.github.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            )}
            {u.linkedin && (
              <a href={ext(u.linkedin)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-text">
                <Linkedin className="size-4" /> LinkedIn
              </a>
            )}
            {u.website && (
              <a href={ext(u.website)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-text">
                <Globe className="size-4" /> {u.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            )}
            <p className="flex items-center gap-2">
              <Calendar className="size-4" /> Joined {new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {u.targetExam && (
          <div className="card p-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Target className="size-4 text-brand" /> Preparing for
            </h2>
            <p className="font-semibold">{u.targetExam}</p>
            {daysLeft !== null && (
              <p className={clsx("mt-1 text-sm", daysLeft <= 7 ? "text-danger" : "text-muted")}>
                {daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? "Exam day — all the best!" : "Exam date passed"}
              </p>
            )}
            {s.infosys.total > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3" /> Infosys SP/DSE set
                  </span>
                  <span>
                    {s.infosys.solved}/{s.infosys.total}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(s.infosys.solved / s.infosys.total) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Topic mastery</h2>
          <div className="space-y-2.5">
            {s.tags.slice(0, 12).map((t) => (
              <div key={t.tag}>
                <div className="flex justify-between text-xs">
                  <span>{t.tag}</span>
                  <span className="text-muted">
                    {t.solved}/{t.total}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-info" style={{ width: `${(t.solved / t.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
          <div className="card flex items-center gap-6 p-5">
            <ProgressRing value={s.solved} total={s.totalProblems} size={110} />
            <div className="flex-1 space-y-2.5">
              {s.difficulty.map((d) => (
                <div key={d.difficulty}>
                  <div className="flex justify-between text-sm">
                    <DifficultyText difficulty={d.difficulty} />
                    <span className="text-muted">
                      {d.solved}
                      <span className="text-faint">/{d.total}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={`h-full rounded-full ${d.difficulty === "Easy" ? "bg-easy" : d.difficulty === "Medium" ? "bg-medium" : "bg-hard"}`}
                      style={{ width: `${d.total ? (d.solved / d.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Score", value: s.score, icon: <Trophy className="size-4 text-medium" /> },
              { label: "Current streak", value: `${s.streak}d`, icon: <Flame className="size-4 text-hard" /> },
              { label: "Submissions", value: s.submissions, icon: <Sparkles className="size-4 text-info" /> },
              { label: "Acceptance", value: `${s.acceptance}%`, icon: <Award className="size-4 text-brand" /> },
            ].map((x) => (
              <div key={x.label} className="card p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  {x.icon} {x.label}
                </div>
                <div className="mt-1 text-2xl font-bold">{x.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <Heatmap data={s.heatmap} />
          <p className="mt-2 text-xs text-faint">Max streak: {s.maxStreak} days</p>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Badges</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
            {s.badges.map((b) => (
              <div
                key={b.id}
                title={b.desc}
                className={clsx("flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center", b.earned ? "border-brand/40 bg-brand-soft/40" : "border-border opacity-45 grayscale")}
              >
                <Award className={clsx("size-7", b.earned ? "text-brand" : "text-faint")} />
                <span className="text-xs font-semibold">{b.label}</span>
                <span className="text-[10px] leading-tight text-muted">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="card">
            <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">Recently solved</h2>
            {s.recent.length === 0 && <p className="p-5 text-sm text-muted">Nothing solved yet.</p>}
            {s.recent.map((r) => (
              <Link key={r.slug} href={`/problems/${r.slug}`} className="flex items-center justify-between border-b border-border px-5 py-2.5 text-sm last:border-0 hover:bg-surface-2">
                <span className="truncate">
                  {r.title}
                  {r.assisted && <Sparkles className="ml-1 inline size-3 text-medium" />}
                </span>
                <span className="ml-3 shrink-0 text-xs text-faint">{timeAgo(r.at)}</span>
              </Link>
            ))}
          </div>
          <div className="card">
            <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">Discussion posts</h2>
            {posts.length === 0 && <p className="p-5 text-sm text-muted">No posts yet.</p>}
            {posts.map((p) => (
              <Link key={String(p._id)} href={`/discuss/${p._id}`} className="flex items-center justify-between border-b border-border px-5 py-2.5 text-sm last:border-0 hover:bg-surface-2">
                <span className="truncate">{p.title}</span>
                <span className="ml-3 shrink-0 text-xs text-faint">
                  ▲ {p.score} · {p.commentCount} comments
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
