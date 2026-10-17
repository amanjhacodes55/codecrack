import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { withUser, error, json, rateLimit } from "@/lib/api";
import { Comment, Discussion } from "@/lib/models/Discussion";
import { notify } from "@/lib/models/Notification";

const Body = z.object({ body: z.string().trim().min(1, "Comment is empty").max(5000), parent: z.string().nullable().optional() });

export const POST = withUser<{ params: Promise<{ id: string }> }>(async (req, ctx, user) => {
  if (!rateLimit(`comment:${user.id}`, 20, 5 * 60_000)) return error("You're commenting too fast.", 429);
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return error("Not found", 404);
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message);
  const d = await Discussion.findById(id).select("deleted author title");
  if (!d || d.deleted) return error("Discussion not found", 404);
  if (parsed.data.parent) {
    if (!isValidObjectId(parsed.data.parent) || !(await Comment.exists({ _id: parsed.data.parent, discussion: id })))
      return error("Parent comment not found");
  }
  const c = await Comment.create({ discussion: id, author: user.id, body: parsed.data.body, parent: parsed.data.parent || null });
  await Discussion.updateOne({ _id: id }, { $inc: { commentCount: 1 } });
  const link = `/discuss/${id}`;
  if (parsed.data.parent) {
    const parent = await Comment.findById(parsed.data.parent).select("author").lean();
    await notify(parent?.author, `${user.name} replied to your comment on “${d.title}”`, link, user.id);
    if (String(parent?.author) !== String(d.author)) await notify(d.author, `${user.name} commented on your post “${d.title}”`, link, user.id);
  } else {
    await notify(d.author, `${user.name} commented on your post “${d.title}”`, link, user.id);
  }
  return json({ id: String(c._id) });
});
