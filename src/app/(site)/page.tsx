import Link from "next/link";
import {
  ArrowRight,
  Bug,
  Building2,
  CalendarClock,
  CheckCircle2,
  EyeOff,
  Flame,
  Gauge,
  MessagesSquare,
  Route,
  ShieldCheck,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Problem } from "@/lib/models/Problem";
import { Track } from "@/lib/models/Track";
import { User } from "@/lib/models/User";
import { Submission } from "@/lib/models/Submission";
import { userProgress } from "@/lib/problems";
import { userStats } from "@/lib/stats";
import ProgressRing from "@/components/ProgressRing";
import { DifficultyText } from "@/components/ui";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Gauge, title: "Real judge", text: "Hidden test cases, time & memory limits, exact verdicts: AC, WA, TLE, MLE, RE — like the Infosys & HackerRank platforms." },
  { icon: Bug, title: "Step debugger", text: "Set breakpoints, step forward and backward, watch variables change line by line. One click to debug a failing test." },
  { icon: EyeOff, title: "Hidden by default", text: "Hints, editorials, solutions and YouTube walkthroughs stay locked until you choose to peek. Assisted solves are tracked honestly." },
  { icon: Route, title: "Step-by-step tracks", text: "A 12-step Infosys SP/DSE path from warm-ups to the Hard slot, plus timed mock tests with partial scoring." },
  { icon: MessagesSquare, title: "Discussions", text: "Threaded comments, upvotes and markdown with code blocks on every problem, plus a community board." },
  { icon: ShieldCheck, title: "Community problems", text: "Anyone can submit a problem. Automated checks verify it, then an admin approves it before it goes live." },
];

export default async function Home() {
  await dbConnect();
  const me = await getCurrentUser();
  const [problemCount, userCount, subCount, track] = await Promise.all([
    Problem.countDocuments({ status: "approved" }),
    User.countDocuments(),
    Submission.countDocuments(),
    Track.findOne({ slug: "crack-infosys-sp-dse" }).lean(),
  ]);

  if (me) return <Dashboard userId={me.id} name={me.name} track={track as unknown as { title: string; steps: { title?: string | null; problems: string[] }[] } | null} />;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--brand)_14%,transparent),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <span className="chip !border-brand/40 !bg-brand-soft !text-brand">
              <Building2 className="size-3.5" /> Infosys SP / DSE · HackWithInfy · InfyTQ
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Practise the way the <span className="text-brand">real exam</span> judges you.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              {problemCount} curated, verified problems from reported Infosys question patterns. A real judge with hidden tests, a line-by-line debugger, and solutions you
              only see when you choose to.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-primary !px-5 !py-2.5 text-base">
                Start practising free <ArrowRight className="size-4" />
              </Link>
              <Link href="/tracks/crack-infosys-sp-dse" className="btn btn-secondary !px-5 !py-2.5 text-base">
                See the Infosys path
              </Link>
            </div>
            <div className="mt-8 flex gap-8 text-sm text-muted">
              <span>
                <b className="text-xl text-text">{problemCount}</b> problems
              </span>
              <span>
                <b className="text-xl text-text">{userCount}</b> {userCount === 1 ? "coder" : "coders"}
              </span>
              <span>
                <b className="text-xl text-text">{subCount}</b> {subCount === 1 ? "submission" : "submissions"}
              </span>
            </div>
          </div>
          <div className="card overflow-hidden font-mono text-[13px] shadow-pop">
            <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-4 py-2.5">
              <span className="size-3 rounded-full bg-red-400" />
              <span className="size-3 rounded-full bg-yellow-400" />
              <span className="size-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-muted">main.py — Longest Subarray with Equal 0s and 1s</span>
            </div>
            <pre className="overflow-x-auto p-4 leading-relaxed">
              <span className="text-faint">{"# prefix sum + hashing\n"}</span>
              <span className="text-[#c678dd]">def</span> <span className="text-info">longest</span>(arr):{"\n"}
              {"    first = {0: -1}\n    s = best = 0\n"}
              {"    "}
              <span className="text-[#c678dd]">for</span> i, x <span className="text-[#c678dd]">in</span> enumerate(arr):{"\n"}
              <span className="block bg-yellow-400/15">{"        s += 1 if x else -1      ➜ i=4, s=0"}</span>
              {"        "}
              <span className="text-[#c678dd]">if</span> s <span className="text-[#c678dd]">in</span> first: best = max(best, i - first[s]){"\n"}
              {"        "}
              <span className="text-[#c678dd]">else</span>: first[s] = i{"\n"}
              {"    "}
              <span className="text-[#c678dd]">return</span> best
            </pre>
            <div className="flex items-center gap-3 border-t border-border bg-brand-soft/50 px-4 py-3 font-sans">
              <CheckCircle2 className="size-5 text-brand" />
              <span className="font-bold text-brand">Accepted</span>
              <span className="text-xs text-muted">22/22 test cases · 41 ms</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold">Everything you need to actually crack it</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <f.icon className="size-6 text-brand" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

async function Dashboard({ userId, name, track }: { userId: string; name: string; track: { title: string; steps: { title?: string | null; problems: string[] }[] } | null }) {
  const [s, progress, me, problems] = await Promise.all([
    userStats(userId),
    userProgress(userId),
    User.findById(userId).select("targetDate targetExam").lean(),
    Problem.find({ status: "approved" }).select("slug title difficulty tags").lean(),
  ]);
  const bySlug = new Map(problems.map((p) => [p.slug, p]));
  const solved = (slug: string) => progress.solved.has(String(bySlug.get(slug)?._id));
  let next: { step: number; title: string; slug: string } | null = null;
  if (track) {
    for (let i = 0; i < track.steps.length && !next; i++) {
      const sl = track.steps[i].problems.find((p: string) => bySlug.has(p) && !solved(p));
      if (sl) next = { step: i + 1, title: track.steps[i].title!, slug: sl };
    }
  }
  const nextProblem = next ? bySlug.get(next.slug) : null;
  const daysLeft = me?.targetDate ? Math.ceil((new Date(me.targetDate).getTime() - Date.now()) / 86400000) : null;
  const weakTags = s.tags.filter((t) => t.total >= 3).sort((a, b) => a.solved / a.total - b.solved / b.total).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-muted">Consistency beats intensity. Two problems a day, every day.</p>
        </div>
        <Link href="/mock" className="btn btn-secondary">
          <Timer className="size-4" /> Timed mock test
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-brand/10 blur-2xl" />
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
            <Route className="size-4" /> {track ? track.title : "Next up"}
          </p>
          {nextProblem && next ? (
            <>
              <h2 className="mt-2 text-xl font-bold">
                Step {next.step}: {next.title}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Next problem: <b className="text-text">{nextProblem.title}</b> · <DifficultyText difficulty={nextProblem.difficulty} />
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/problems/${next.slug}`} className="btn btn-primary">
                  Continue <ArrowRight className="size-4" />
                </Link>
                <Link href="/tracks/crack-infosys-sp-dse" className="btn btn-secondary">
                  View full path
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-xl font-bold">You&apos;ve completed the track! 🎉</h2>
              <p className="mt-1 text-sm text-muted">Now take mock tests and re-solve your assisted problems.</p>
            </>
          )}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted">
              <span>Infosys SP/DSE set</span>
              <span>
                {s.infosys.solved}/{s.infosys.total}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(s.infosys.solved / Math.max(1, s.infosys.total)) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="card flex flex-col justify-between p-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <CalendarClock className="size-4" /> {me?.targetExam || "Exam countdown"}
            </p>
            {daysLeft !== null ? (
              <>
                <p className={`mt-2 text-5xl font-extrabold ${daysLeft <= 7 ? "text-danger" : ""}`}>{Math.max(0, daysLeft)}</p>
                <p className="text-sm text-muted">days left</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Set your exam date in{" "}
                <Link href="/settings" className="font-semibold text-brand">
                  settings
                </Link>{" "}
                to see a countdown here.
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-5 text-sm">
            <span className="flex items-center gap-1.5">
              <Flame className="size-4 text-hard" /> <b>{s.streak}</b> day streak
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="size-4 text-medium" /> <b>{s.score}</b> pts
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card flex items-center gap-6 p-6">
          <ProgressRing value={s.solved} total={s.totalProblems} size={104} />
          <div className="flex-1 space-y-2">
            {s.difficulty.map((d) => (
              <div key={d.difficulty} className="flex justify-between text-sm">
                <DifficultyText difficulty={d.difficulty} />
                <span className="text-muted">
                  {d.solved}/{d.total}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-semibold">Focus areas</h3>
          <p className="mb-3 text-xs text-muted">Topics where you&apos;ve solved the least so far</p>
          <div className="space-y-2.5">
            {weakTags.map((t) => (
              <Link key={t.tag} href={`/problems?tag=${encodeURIComponent(t.tag)}&status=todo`} className="block">
                <div className="flex justify-between text-sm">
                  <span className="hover:text-brand">{t.tag}</span>
                  <span className="text-xs text-muted">
                    {t.solved}/{t.total}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-info" style={{ width: `${(t.solved / t.total) * 100}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="mb-3 text-sm font-semibold">Recently solved</h3>
          {s.recent.length === 0 ? (
            <p className="text-sm text-muted">Nothing yet — your first Accepted is one click away.</p>
          ) : (
            <div className="space-y-2">
              {s.recent.slice(0, 5).map((r) => (
                <Link key={r.slug} href={`/problems/${r.slug}`} className="flex items-center gap-2 text-sm hover:text-brand">
                  <CheckCircle2 className="size-4 shrink-0 text-brand" />
                  <span className="truncate">{r.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/problems?collection=infosys-sp-dse", icon: Building2, label: "Infosys SP/DSE set", sub: "Reported question patterns" },
          { href: "/tracks/hashing-prefix-drill", icon: Route, label: "Hashing drill", sub: "Your practice list" },
          { href: "/discuss", icon: Users, label: "Community", sub: "Exam experiences & doubts" },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="card flex items-center gap-4 p-5 hover:border-brand">
            <x.icon className="size-6 text-brand" />
            <div>
              <p className="font-semibold">{x.label}</p>
              <p className="text-xs text-muted">{x.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
