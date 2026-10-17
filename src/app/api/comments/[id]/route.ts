import { isValidObjectId } from "mongoose";
import { withUser, error, json } from "@/lib/api";
import { Comment, Discussion } from "@/lib/models/Discussion";

export const DELETE = withUser<{ params: Promise<{ id: string }> }>(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return error("Not found", 404);
  const c = await Comment.findById(id);
  if (!c || c.deleted) return error("Not found", 404);
  if (String(c.author) !== user.id && user.role !== "admin") return error("Not allowed", 403);
  c.deleted = true;
  await c.save();
  await Discussion.updateOne({ _id: c.discussion }, { $inc: { commentCount: -1 } });
  return json({ ok: true });
});
