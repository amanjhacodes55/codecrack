import { withUser, json } from "@/lib/api";
import { Submission } from "@/lib/models/Submission";

export const GET = withUser(async (req, _ctx, user) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const q: Record<string, unknown> = { user: user.id };
  if (slug) q.slug = slug;
  const subs = await Submission.find(q)
    .sort({ createdAt: -1 })
    .limit(50)
    .select("slug language verdict passed total timeMs memoryKb createdAt assisted")
    .lean();
  return json({ submissions: subs.map((s) => ({ ...s, id: String(s._id), _id: undefined })) });
});
