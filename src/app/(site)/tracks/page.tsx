import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Track } from "@/lib/models/Track";
import { Problem } from "@/lib/models/Problem";
import { userProgress } from "@/lib/problems";

export const metadata = { title: "Prep tracks" };
export const dynamic = "force-dynamic";

export default async function TracksPage() {
  await dbConnect();
  const me = await getCurrentUser();
  const [tracks, progress, problems] = await Promise.all([
    Track.find().sort({ order: 1 }).lean(),
    userProgress(me?.id),
    Problem.find({ status: "approved" }).select("slug").lean(),
  ]);
  const idBySlug = new Map(problems.map((p) => [p.slug, String(p._id)]));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Prep tracks</h1>
      <p className="mt-1 text-sm text-muted">Curated, ordered paths. Follow the steps instead of picking random problems.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {tracks.map((t) => {
          const slugs = [...new Set(t.steps.flatMap((s) => s.problems))];
          const done = slugs.filter((s) => progress.solved.has(idBySlug.get(s) || "")).length;
          return (
            <Link key={t.slug} href={`/tracks/${t.slug}`} className="card group flex flex-col p-6 transition-colors hover:border-brand">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft">
                  <Route className="size-5 text-brand" />
                </span>
                <div>
                  <h2 className="font-bold">{t.title}</h2>
                  <p className="text-xs text-muted">
                    {t.steps.length} steps · {slugs.length} problems
                  </p>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-muted">{t.subtitle}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted">
                  <span>Progress</span>
                  <span>
                    {done}/{slugs.length}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(done / Math.max(1, slugs.length)) * 100}%` }} />
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                {done ? "Continue" : "Start"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
