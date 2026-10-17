import { isValidObjectId } from "mongoose";
import { withUser, error, json } from "@/lib/api";
import { Submission } from "@/lib/models/Submission";

export const GET = withUser<{ params: Promise<{ id: string }> }>(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return error("Not found", 404);
  const s = await Submission.findById(id).lean();
  if (!s) return error("Not found", 404);
  if (String(s.user) !== user.id && user.role !== "admin") return error("Not allowed", 403);
  return json({ submission: { ...s, id: String(s._id) } });
});
