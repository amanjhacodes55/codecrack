import { isValidObjectId } from "mongoose";
import { withUser, error, json } from "@/lib/api";
import { Comment } from "@/lib/models/Discussion";

export const POST = withUser<{ params: Promise<{ id: string }> }>(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return error("Not found", 404);
  const c = await Comment.findById(id).select("upvotes");
  if (!c) return error("Not found", 404);
  const has = c.upvotes.some((u) => String(u) === user.id);
  const updated = await Comment.findByIdAndUpdate(
    id,
    has ? { $pull: { upvotes: user.id }, $inc: { score: -1 } } : { $addToSet: { upvotes: user.id }, $inc: { score: 1 } },
    { new: true }
  ).select("score");
  return json({ upvoted: !has, score: updated?.score ?? 0 });
});
