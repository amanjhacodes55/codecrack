import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { Problem } from "@/lib/models/Problem";
import { User } from "@/lib/models/User";

export const POST = withUser(async (req, _ctx, user) => {
  const parsed = z.object({ slug: z.string() }).safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  const p = await Problem.findOne({ slug: parsed.data.slug }).select("_id").lean();
  if (!p) return error("Problem not found", 404);
  const me = await User.findById(user.id).select("bookmarks").lean();
  const has = me?.bookmarks?.some((b) => String(b) === String(p._id));
  await User.updateOne({ _id: user.id }, has ? { $pull: { bookmarks: p._id } } : { $addToSet: { bookmarks: p._id } });
  return json({ bookmarked: !has });
});
