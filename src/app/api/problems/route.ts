import { withUser, error, json, rateLimit } from "@/lib/api";
import { Problem } from "@/lib/models/Problem";
import { ProblemInput, slugify, toDoc } from "@/lib/problemInput";
import { runChecks } from "@/lib/checks";

// Community problem submission → goes to the admin review queue.
export const POST = withUser(async (req, _ctx, user) => {
  if (!rateLimit(`newproblem:${user.id}`, 10, 60 * 60_000)) return error("Too many problems submitted this hour.", 429);
  const parsed = ProblemInput.safeParse(await req.json());
  if (!parsed.success) return error(`${parsed.error.issues[0].path.join(".")}: ${parsed.error.issues[0].message}`);
  let slug = slugify(parsed.data.title) || "problem";
  if (await Problem.exists({ slug })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  const doc = await Problem.create({ ...toDoc(parsed.data), slug, origin: "community", author: user.id, order: 5000 });
  if (doc.status === "pending") {
    const full = await Problem.findById(doc._id).select("+tests +solution");
    if (full) {
      full.set("checks", await runChecks(full));
      full.checkedAt = new Date();
      await full.save();
    }
  }
  return json({ slug, status: doc.status });
});
