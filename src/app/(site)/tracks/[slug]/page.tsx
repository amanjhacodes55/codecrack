import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { BookOpen, CheckCircle2, CircleDashed, Circle, Lightbulb, Timer } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Track } from "@/lib/models/Track";
import { Problem } from "@/lib/models/Problem";
import { userProgress } from "@/lib/problems";
import Markdown from "@/components/Markdown";
import { DifficultyText } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  const t = await Track.findOne({ slug: (await params).slug }).select("title").lean();
  return { title: t?.title || "Track" };
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const me = await getCurrentUser();
  const t = await Track.findOne({ slug }).lean();
  if (!t) notFound();
  const slugs = [...new Set(t.steps.flatMap((s) => s.problems))];
  const [problems, progress] = await Promise.all([
    Problem.find({ slug: { $in: slugs }, status: "approved" }).select("slug title difficulty tags").lean(),
    userProgress(me?.id),
  ]);
  const bySlug = new Map(problems.map((p) => [p.slug, p]));
  const isSolved = (s: string) => progress.solved.has(String(bySlug.get(s)?._id));
  const isTried = (s: string) => progress.attempted.has(String(bySlug.get(s)?._id));
  const total = slugs.filter((s) => bySlug.has(s)).length;
  const done = slugs.filter(isSolved).length;
  const currentStep = t.steps.findIndex((s) => s.problems.some((p) => bySlug.has(p) && !isSolved(p)));
  const nextProblem = currentStep >= 0 ? t.steps[currentStep].problems.find((p) => bySlug.has(p) && !isSolved(p)) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-soft via-transparent to-info-soft/40 p-6">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="mt-1 text-muted">{t.subtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <div className="min-w-[220px] flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {done} of {total} solved
                </span>
                <span className="text-muted">{Math.round((done / Math.max(1, total)) * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
              </div>
            </div>
            {nextProblem && (
              <Link href={`/problems/${nextProblem}`} className="btn btn-primary">
                {done ? "Continue" : "Start"}: {bySlug.get(nextProblem)?.title}
              </Link>
            )}
            {t.company === "Infosys" && (
              <Link href="/mock" className="btn btn-secondary">
                <Timer className="size-4" /> Take a timed mock test
              </Link>
            )}
          </div>
        </div>
        {t.description && (
          <div className="border-t border-border p-6">
            <Markdown>{t.description}</Markdown>
          </div>
        )}
      </div>

      <ol className="relative mt-8 space-y-6 border-l-2 border-border pl-6">
        {t.steps.map((s, i) => {
          const list = s.problems.filter((p) => bySlug.has(p));
          const sd = list.filter(isSolved).length;
          const complete = list.length > 0 && sd === list.length;
          return (
            <li key={i} className="relative">
              <span
                className={clsx(
                  "absolute -left-[37px] flex size-6 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                  complete ? "border-brand bg-brand text-brand-fg" : i === currentStep ? "border-brand bg-surface text-brand" : "border-border bg-surface text-muted"
                )}
              >
                {complete ? "✓" : i + 1}
              </span>
              <div className={clsx("card overflow-hidden", i === currentStep && "ring-2 ring-brand/40")}>
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold">
                      Step {i + 1}: {s.title}
                    </h2>
                    <span className="text-sm text-muted">
                      {sd}/{list.length}
                    </span>
                  </div>
                  {s.goal && <p className="mt-1 text-sm text-muted">{s.goal}</p>}
                  {(s.tips?.length || 0) > 0 && (
                    <details className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-sm" open={i === currentStep}>
                      <summary className="flex cursor-pointer items-center gap-1.5 font-semibold">
                        <Lightbulb className="size-4 text-medium" /> Key ideas &amp; exam tips
                      </summary>
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {s.tips!.map((tip, j) => (
                          <li key={j}>
                            <Markdown className="[&>p]:inline">{tip}</Markdown>
                          </li>
                        ))}
                      </ul>
                      {(s.resources?.length || 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {s.resources!.map((r) => (
                            <a key={r.url} href={r.url!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-info hover:underline">
                              <BookOpen className="size-3" /> {r.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </details>
                  )}
                </div>
                <div className="border-t border-border">
                  {list.map((p, j) => {
                    const prob = bySlug.get(p)!;
                    return (
                      <Link key={p} href={`/problems/${p}`} className="flex items-center gap-3 border-b border-border px-5 py-2.5 text-sm last:border-0 hover:bg-surface-2">
                        {isSolved(p) ? (
                          <CheckCircle2 className="size-4 shrink-0 text-brand" />
                        ) : isTried(p) ? (
                          <CircleDashed className="size-4 shrink-0 text-medium" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-faint" />
                        )}
                        <span className="w-6 text-xs text-faint">{j + 1}.</span>
                        <span className="flex-1 truncate font-medium">{prob.title}</span>
                        <span className="hidden truncate text-xs text-muted sm:block">{prob.tags.slice(0, 2).join(" · ")}</span>
                        <span className="w-16 text-right">
                          <DifficultyText difficulty={prob.difficulty} />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
