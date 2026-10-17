import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { withUser, error, json } from "@/lib/api";
import { Comment, Discussion } from "@/lib/models/Discussion";
import "@/lib/models/User";
import "@/lib/models/Problem";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  await dbConnect();
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return error("Not found", 404);
  const me = await getCurrentUser();
  const d = await Discussion.findOneAndUpdate({ _id: id, deleted: false }, { $inc: { views: 1 } }, { new: true })
    .populate("author", "name username image role")
    .populate("problem", "slug title")
    .lean();
  if (!d) return error("Not found", 404);
  const comments = await Comment.find({ discussion: id }).sort({ createdAt: 1 }).populate("author", "name username image role").lean();
  return json({
    discussion: {
      id: String(d._id),
      title: d.title,
      body: d.body,
      kind: d.kind,
      score: d.score,
      upvoted: me ? d.upvotes.some((u) => String(u) === me.id) : false,
      views: d.views,
      pinned: d.pinned,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      author: d.author,
      problem: d.problem,
    },
    comments: comments.map((c) => ({
      id: String(c._id),
      parent: c.parent ? String(c.parent) : null,
      body: c.deleted ? "" : c.body,
      deleted: c.deleted,
      score: c.score,
      upvoted: me ? c.upvotes.some((u) => String(u) === me.id) : false,
      createdAt: c.createdAt,
      author: c.deleted ? null : c.author,
    })),
  });
}

const Patch = z.object({
  title: z.string().trim().min(5).max(150).optional(),
  body: z.string().trim().min(10).max(20_000).optional(),
  pinned: z.boolean().optional(),
});

export const PATCH = withUser<Ctx>(async (req, ctx, user) => {
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return error("Not found", 404);
  const d = await Discussion.findById(id);
  if (!d || d.deleted) return error("Not found", 404);
  const isOwner = String(d.author) === user.id;
  const isAdmin = user.role === "admin";
  const parsed = Patch.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message);
  if ((parsed.data.title || parsed.data.body) && !isOwner && !isAdmin) return error("Not allowed", 403);
  if (parsed.data.pinned !== undefined && !isAdmin) return error("Only admins can pin", 403);
  Object.assign(d, parsed.data);
  await d.save();
  return json({ ok: true });
});

export const DELETE = withUser<Ctx>(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return error("Not found", 404);
  const d = await Discussion.findById(id);
  if (!d) return error("Not found", 404);
  if (String(d.author) !== user.id && user.role !== "admin") return error("Not allowed", 403);
  d.deleted = true;
  await d.save();
  return json({ ok: true });
});
