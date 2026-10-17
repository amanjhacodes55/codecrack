import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { findVisibleProblem } from "@/lib/problems";
import { User } from "@/lib/models/User";

const Body = z.object({ kind: z.enum(["editorial", "solution", "videos"]) });

export const POST = withUser<{ params: Promise<{ slug: string }> }>(async (req, ctx, user) => {
  const { slug } = await ctx.params;
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  const p = await findVisibleProblem(slug, user, "+editorial +solution +youtube");
  if (!p) return error("Problem not found", 404);
  // Videos are a hint-level reveal; editorial and solution count as "assisted".
  if (parsed.data.kind !== "videos") await User.updateOne({ _id: user.id }, { $addToSet: { revealed: p._id } });
  if (parsed.data.kind === "editorial") return json({ editorial: p.editorial || "" });
  if (parsed.data.kind === "videos") return json({ videos: p.youtube || [] });
  return json({ solution: Object.fromEntries(p.solution || new Map()) });
});
