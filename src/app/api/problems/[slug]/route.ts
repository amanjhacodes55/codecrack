import { withUser, error, json } from "@/lib/api";
import { Problem } from "@/lib/models/Problem";
import { ProblemInput, toDoc } from "@/lib/problemInput";
import { runChecks } from "@/lib/checks";
import { loadTests } from "@/lib/tests";

type Ctx = { params: Promise<{ slug: string }> };

// Full problem (including tests & solution) for its author or an admin — used by the editor form.
export const GET = withUser<Ctx>(async (_req, ctx, user) => {
  const { slug } = await ctx.params;
  const p = await Problem.findOne({ slug }).select("+tests +testsGz +solution +editorial +youtube").lean();
  if (!p) return error("Not found", 404);
  if (String(p.author) !== user.id && user.role !== "admin") return error("Not allowed", 403);
  return json({ problem: JSON.parse(JSON.stringify({ ...p, testsGz: undefined, tests: loadTests(p) })) });
});

// Author edits their problem (while not yet approved) and resubmits.
export const PUT = withUser<Ctx>(async (req, ctx, user) => {
  const { slug } = await ctx.params;
  const p = await Problem.findOne({ slug }).select("+tests +solution");
  if (!p) return error("Not found", 404);
  const isAdmin = user.role === "admin";
  if (String(p.author) !== user.id && !isAdmin) return error("Not allowed", 403);
  if (p.status === "approved" && !isAdmin) return error("Approved problems can only be edited by admins.");
  const parsed = ProblemInput.safeParse(await req.json());
  if (!parsed.success) return error(`${parsed.error.issues[0].path.join(".")}: ${parsed.error.issues[0].message}`);
  const doc = toDoc(parsed.data);
  if (p.status === "approved") doc.status = "approved";
  p.set(doc);
  p.set("testsGz", undefined);
  await p.save();
  if (p.status === "pending") {
    p.set("checks", await runChecks(p));
    p.checkedAt = new Date();
    await p.save();
  }
  return json({ slug: p.slug, status: p.status });
});
