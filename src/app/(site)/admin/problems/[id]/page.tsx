import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ExternalLink } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { Problem } from "@/lib/models/Problem";
import "@/lib/models/User";
import Markdown from "@/components/Markdown";
import StatusBadge from "@/components/StatusBadge";
import { DifficultyBadge, timeAgo } from "@/components/ui";
import { IOBlock } from "@/components/CodeBlock";
import ReviewPanel from "@/components/ReviewPanel";
import { plain } from "@/lib/serialize";

export const metadata = { title: "Review problem" };

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await dbConnect();
  const p = await Problem.findById(id).select("+tests +solution +editorial +youtube").populate("author", "name username email").lean();
  if (!p) notFound();
  const author = p.author as unknown as { name: string; username: string; email: string } | null;
  const sol = (p.solution as unknown as Record<string, string>)?.python || "";
  const hidden = p.tests.filter((t) => !t.sample);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-5">
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold">{p.title}</h2>
            <DifficultyBadge difficulty={p.difficulty} />
            <StatusBadge status={p.status} />
            <Link href={`/problems/${p.slug}`} target="_blank" className="btn btn-secondary btn-sm ml-auto">
              Try solving it <ExternalLink className="size-3.5" />
            </Link>
          </div>
          <p className="mt-2 text-xs text-muted">
            by {author?.name} (@{author?.username}, {author?.email}) · updated {timeAgo(p.updatedAt)} · tags: {p.tags.join(", ") || "—"} · companies:{" "}
            {p.companies.join(", ") || "—"} · source: {p.source || "—"}
          </p>
          <Markdown className="mt-5">{p.statement}</Markdown>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["Input format", p.inputFormat],
              ["Output format", p.outputFormat],
              ["Constraints", p.constraints],
            ].map(([l, v]) => (
              <div key={l}>
                <h3 className="mb-1 text-sm font-bold">{l}</h3>
                <Markdown>{v || "_missing_"}</Markdown>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-3 p-6">
          <h3 className="font-semibold">
            Tests — {p.samples.length} samples, {hidden.length} hidden
          </h3>
          {p.samples.map((s, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-2">
              <IOBlock label={`Sample ${i + 1} input`} text={s.input || ""} />
              <IOBlock label="Output" text={s.output || ""} />
            </div>
          ))}
          {hidden.slice(0, 6).map((t, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-2">
              <IOBlock label={`Hidden ${i + 1} input`} text={(t.input || "").slice(0, 2000)} />
              <IOBlock label="Output" text={(t.output || "").slice(0, 2000)} />
            </div>
          ))}
          {hidden.length > 6 && <p className="text-xs text-muted">…and {hidden.length - 6} more hidden tests.</p>}
        </div>

        <div className="card p-6">
          <h3 className="mb-2 font-semibold">Reference solution</h3>
          <Markdown>{"```python\n" + (sol || "# missing") + "\n```"}</Markdown>
          {p.editorial && (
            <>
              <h3 className="mb-2 mt-5 font-semibold">Editorial</h3>
              <Markdown>{p.editorial}</Markdown>
            </>
          )}
        </div>
      </div>

      <aside>
        <ReviewPanel
          id={String(p._id)}
          status={p.status}
          difficulty={p.difficulty}
          collections={p.collections}
          checks={plain(p.checks || []) as unknown as Parameters<typeof ReviewPanel>[0]["checks"]}
          checkedAt={p.checkedAt ? new Date(p.checkedAt).toISOString() : null}
          notes={p.reviewNotes || ""}
        />
      </aside>
    </div>
  );
}
