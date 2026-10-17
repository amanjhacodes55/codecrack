import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { withUser, error, json, rateLimit } from "@/lib/api";
import { Discussion } from "@/lib/models/Discussion";
import { Problem } from "@/lib/models/Problem";
import "@/lib/models/User";

export async function GET(req: Request) {
  await dbConnect();
  const me = await getCurrentUser();
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const sort = url.searchParams.get("sort") || "top";
  const kind = url.searchParams.get("kind");
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const q: Record<string, unknown> = { deleted: false };
  if (slug) {
    const p = await Problem.findOne({ slug }).select("_id").lean();
    if (!p) return error("Problem not found", 404);
    q.problem = p._id;
  }
  if (kind) q.kind = kind;
  const order: Record<string, 1 | -1> =
    sort === "new" ? { pinned: -1, createdAt: -1 } : { pinned: -1, score: -1, createdAt: -1 };
  const [items, total] = await Promise.all([
    Discussion.find(q)
      .sort(order)
      .skip((page - 1) * 20)
      .limit(20)
      .populate("author", "name username image")
      .populate("problem", "slug title")
      .lean(),
    Discussion.countDocuments(q),
  ]);
  return json({
    total,
    items: items.map((d) => ({
      id: String(d._id),
      title: d.title,
      kind: d.kind,
      preview: d.body.slice(0, 220),
      score: d.score,
      upvoted: me ? d.upvotes.some((u) => String(u) === me.id) : false,
      commentCount: d.commentCount,
      views: d.views,
      pinned: d.pinned,
      createdAt: d.createdAt,
      author: d.author,
      problem: d.problem,
    })),
  });
}

const Body = z.object({
  slug: z.string().optional().nullable(),
  title: z.string().trim().min(5, "Title should be at least 5 characters").max(150),
  body: z.string().trim().min(10, "Write a little more (10+ characters)").max(20_000),
  kind: z.enum(["question", "solution", "tip", "general"]).default("general"),
});

export const POST = withUser(async (req, _ctx, user) => {
  if (!rateLimit(`post:${user.id}`, 10, 10 * 60_000)) return error("You're posting too fast.", 429);
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message);
  let problem = null;
  if (parsed.data.slug) {
    problem = await Problem.findOne({ slug: parsed.data.slug }).select("_id").lean();
    if (!problem) return error("Problem not found", 404);
  }
  const d = await Discussion.create({
    problem: problem?._id,
    author: user.id,
    title: parsed.data.title,
    body: parsed.data.body,
    kind: parsed.data.kind,
  });
  return json({ id: String(d._id) });
});
