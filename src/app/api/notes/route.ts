import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { Note } from "@/lib/models/Discussion";
import { Problem } from "@/lib/models/Problem";

const Body = z.object({ slug: z.string(), body: z.string().max(20_000) });

export const PUT = withUser(async (req, _ctx, user) => {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  const p = await Problem.findOne({ slug: parsed.data.slug }).select("_id").lean();
  if (!p) return error("Problem not found", 404);
  await Note.updateOne({ user: user.id, problem: p._id }, { $set: { body: parsed.data.body } }, { upsert: true });
  return json({ ok: true });
});
