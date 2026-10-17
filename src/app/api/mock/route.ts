import { withUser, json, error } from "@/lib/api";
import { Submission } from "@/lib/models/Submission";

// Best result per problem since the mock started — used for partial scoring (like the real exam).
export const GET = withUser(async (req, _ctx, user) => {
  const url = new URL(req.url);
  const slugs = (url.searchParams.get("slugs") || "").split(",").filter(Boolean).slice(0, 5);
  const since = new Date(Number(url.searchParams.get("since") || 0));
  if (!slugs.length || isNaN(since.getTime())) return error("Invalid request");
  const subs = await Submission.find({ user: user.id, slug: { $in: slugs }, createdAt: { $gte: since } }).select("slug passed total verdict").lean();
  const best: Record<string, { passed: number; total: number; attempts: number; accepted: boolean }> = {};
  for (const s of subs) {
    const b = best[s.slug] || { passed: 0, total: s.total, attempts: 0, accepted: false };
    b.attempts++;
    if (s.passed / Math.max(1, s.total) > b.passed / Math.max(1, b.total)) {
      b.passed = s.passed;
      b.total = s.total;
    }
    b.accepted ||= s.verdict === "Accepted";
    best[s.slug] = b;
  }
  return json({ best });
});
