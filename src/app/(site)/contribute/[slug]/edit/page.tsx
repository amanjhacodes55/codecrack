import { notFound, redirect } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Problem } from "@/lib/models/Problem";
import ProblemForm, { type ProblemFormValue } from "@/components/ProblemForm";

export const metadata = { title: "Edit problem" };

export default async function EditProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const me = await getCurrentUser();
  if (!me) redirect(`/login?callbackUrl=/contribute/${slug}/edit`);
  await dbConnect();
  const p = await Problem.findOne({ slug }).select("+tests +solution +editorial +youtube").lean();
  if (!p || (String(p.author) !== me.id && me.role !== "admin")) notFound();
  const sol = p.solution as unknown as Record<string, string> | undefined;
  const starter = p.starter as unknown as Record<string, string> | undefined;
  const initial: ProblemFormValue = {
    title: p.title,
    difficulty: p.difficulty as ProblemFormValue["difficulty"],
    tags: p.tags.join(", "),
    companies: p.companies.join(", "),
    source: p.source || "",
    statement: p.statement,
    inputFormat: p.inputFormat || "",
    outputFormat: p.outputFormat || "",
    constraints: p.constraints || "",
    samples: p.samples.map((s) => ({ input: s.input || "", output: s.output || "", explanation: s.explanation || "" })),
    tests: p.tests.filter((t) => !t.sample).map((t) => ({ input: t.input || "", output: t.output || "" })),
    hints: p.hints.length ? p.hints : [""],
    editorial: p.editorial || "",
    youtube: (p.youtube || []).map((y) => ({ title: y.title || "", url: y.url || "", kind: (y.kind as "video" | "search") || "video" })),
    solution: sol?.python || "",
    starter: starter?.python || "",
    timeLimitMs: p.timeLimitMs,
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit: {p.title}</h1>
      <ProblemForm initial={initial} slug={slug} />
    </div>
  );
}
