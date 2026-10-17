import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Problem } from "@/lib/models/Problem";
import { User } from "@/lib/models/User";
import { Draft, Note } from "@/lib/models/Discussion";
import { Submission } from "@/lib/models/Submission";
import { findVisibleProblem } from "@/lib/problems";
import { enabledLanguages } from "@/lib/runner";
import Workspace from "@/components/workspace/Workspace";
import type { ProblemData } from "@/components/workspace/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const p = await Problem.findOne({ slug }).select("title").lean();
  return { title: p?.title || "Problem" };
}

export default async function ProblemPage({ params }: Params) {
  const { slug } = await params;
  await dbConnect();
  const user = await getCurrentUser();
  const p = await findVisibleProblem(slug, user, "+editorial +youtube +solution");
  if (!p) notFound();

  const [drafts, note, me, solved, ordered] = await Promise.all([
    user ? Draft.find({ user: user.id, problem: p._id }).lean() : [],
    user ? Note.findOne({ user: user.id, problem: p._id }).lean() : null,
    user ? User.findById(user.id).select("bookmarks preferredLanguage").lean() : null,
    user ? Submission.exists({ user: user.id, problem: p._id, verdict: "Accepted" }) : null,
    Problem.find({ status: "approved" }).select("slug").sort({ order: 1, createdAt: 1 }).lean(),
  ]);
  const idx = ordered.findIndex((x) => x.slug === slug);

  const problem: ProblemData = {
    id: String(p._id),
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty as ProblemData["difficulty"],
    tags: p.tags,
    companies: p.companies,
    collections: p.collections,
    source: p.source || "",
    statement: p.statement,
    inputFormat: p.inputFormat || "",
    outputFormat: p.outputFormat || "",
    constraints: p.constraints || "",
    samples: p.samples.map((s) => ({ input: s.input || "", output: s.output || "", explanation: s.explanation || "" })),
    hints: p.hints,
    timeLimitMs: p.timeLimitMs,
    memoryMb: p.memoryMb,
    starter: Object.fromEntries(p.starter || new Map()),
    stats: { submissions: p.stats?.submissions || 0, accepted: p.stats?.accepted || 0, solvedBy: p.stats?.solvedBy || 0 },
    origin: p.origin,
    status: p.status,
    hasEditorial: !!p.editorial?.trim(),
    hasVideos: (p.youtube?.length || 0) > 0,
    hasSolution: (p.solution?.size || 0) > 0,
  };

  return (
    <Workspace
      problem={problem}
      me={user ? { id: user.id, role: user.role, name: user.name } : null}
      languages={enabledLanguages()}
      preferredLanguage={me?.preferredLanguage || "python"}
      drafts={Object.fromEntries(drafts.map((d) => [d.language, { code: d.code, updatedAt: new Date(d.updatedAt).toISOString() }]))}
      note={note?.body || ""}
      bookmarked={!!me?.bookmarks?.some((b) => String(b) === String(p._id))}
      solved={!!solved}
      prev={idx > 0 ? ordered[idx - 1].slug : null}
      next={idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1].slug : null}
    />
  );
}
