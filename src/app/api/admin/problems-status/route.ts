import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { Problem } from "@/lib/models/Problem";

// Hide / show any problem (official ones included) without deleting submissions.
const Body = z.object({ id: z.string(), status: z.enum(["approved", "draft"]) });

export const POST = withUser(
  async (req) => {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success || !isValidObjectId(parsed.data.id)) return error("Invalid request");
    await Problem.updateOne({ _id: parsed.data.id }, { $set: { status: parsed.data.status } });
    return json({ ok: true });
  },
  { admin: true }
);
