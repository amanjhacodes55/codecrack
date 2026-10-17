import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { Draft } from "@/lib/models/Discussion";
import { Problem } from "@/lib/models/Problem";

const Body = z.object({ slug: z.string(), language: z.string(), code: z.string().max(100_000) });

export const PUT = withUser(async (req, _ctx, user) => {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  const p = await Problem.findOne({ slug: parsed.data.slug }).select("_id").lean();
  if (!p) return error("Problem not found", 404);
  await Draft.updateOne(
    { user: user.id, problem: p._id, language: parsed.data.language },
    { $set: { code: parsed.data.code } },
    { upsert: true }
  );
  return json({ ok: true });
});
