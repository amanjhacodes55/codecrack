import { isValidObjectId } from "mongoose";
import { withUser, error, json } from "@/lib/api";
import { Problem } from "@/lib/models/Problem";
import { runChecks } from "@/lib/checks";

export const POST = withUser<{ params: Promise<{ id: string }> }>(
  async (_req, ctx) => {
    const { id } = await ctx.params;
    if (!isValidObjectId(id)) return error("Not found", 404);
    const p = await Problem.findById(id).select("+tests +solution");
    if (!p) return error("Not found", 404);
    p.set("checks", await runChecks(p));
    p.checkedAt = new Date();
    await p.save();
    return json({ checks: p.checks, checkedAt: p.checkedAt });
  },
  { admin: true }
);
