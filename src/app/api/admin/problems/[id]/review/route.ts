import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { Problem } from "@/lib/models/Problem";
import { checksPass, runChecks, type Check } from "@/lib/checks";
import { notify } from "@/lib/models/Notification";

const Body = z.object({
  action: z.enum(["approve", "reject", "changes", "unpublish"]),
  notes: z.string().max(5000).default(""),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  collections: z.array(z.string()).optional(),
});

export const POST = withUser<{ params: Promise<{ id: string }> }>(
  async (req, ctx, user) => {
    const { id } = await ctx.params;
    if (!isValidObjectId(id)) return error("Not found", 404);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return error("Invalid request");
    const p = await Problem.findById(id).select("+tests +testsGz +solution");
    if (!p) return error("Not found", 404);
    const { action, notes } = parsed.data;
    if (action === "approve") {
      // Always re-verify right before publishing.
      p.set("checks", await runChecks(p));
      p.checkedAt = new Date();
      if (!checksPass(p.checks as unknown as Check[])) {
        await p.save();
        return error("Automated checks are failing — fix them (or request changes) before approving.", 422);
      }
      p.status = "approved";
      if (parsed.data.difficulty) p.difficulty = parsed.data.difficulty;
      if (parsed.data.collections) p.collections = parsed.data.collections;
    } else if (action === "reject") p.status = "rejected";
    else if (action === "changes") p.status = "changes_requested";
    else p.status = "pending";
    p.reviewNotes = notes;
    p.reviewedBy = user.id as unknown as typeof p.reviewedBy;
    p.reviewedAt = new Date();
    await p.save();
    const msg = {
      approve: `🎉 Your problem “${p.title}” was approved and is now live!`,
      reject: `Your problem “${p.title}” was rejected${notes ? `: ${notes}` : "."}`,
      changes: `Changes requested on “${p.title}”${notes ? `: ${notes}` : "."}`,
      unpublish: `Your problem “${p.title}” was moved back to review.`,
    }[action];
    await notify(p.author, msg, action === "approve" ? `/problems/${p.slug}` : "/contribute", user.id);
    return json({ status: p.status, checks: p.checks });
  },
  { admin: true }
);
