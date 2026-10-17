import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { User } from "@/lib/models/User";

const Body = z.object({ id: z.string(), role: z.enum(["user", "admin"]).optional(), banned: z.boolean().optional() });

export const PATCH = withUser(
  async (req, _ctx, user) => {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success || !isValidObjectId(parsed.data.id)) return error("Invalid request");
    if (parsed.data.id === user.id) return error("You can't change your own role or ban yourself.");
    const { id, ...rest } = parsed.data;
    await User.updateOne({ _id: id }, { $set: rest });
    return json({ ok: true });
  },
  { admin: true }
);
