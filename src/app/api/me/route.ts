import { z } from "zod";
import { withUser, error, json } from "@/lib/api";
import { User } from "@/lib/models/User";

const url = z.string().trim().max(200).optional().or(z.literal(""));
const Body = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/, "Username: 3–20 letters, digits or _").optional(),
  bio: z.string().max(300).optional(),
  college: z.string().max(120).optional(),
  location: z.string().max(80).optional(),
  github: url,
  linkedin: url,
  website: url,
  image: url,
  targetExam: z.string().max(80).optional(),
  targetDate: z.string().nullable().optional(),
  preferredLanguage: z.string().max(20).optional(),
});

export const PATCH = withUser(async (req, _ctx, user) => {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message);
  const data: Record<string, unknown> = { ...parsed.data };
  if (data.username && data.username !== user.username && (await User.exists({ username: data.username })))
    return error("That username is taken.");
  if ("targetDate" in data) data.targetDate = data.targetDate ? new Date(String(data.targetDate)) : null;
  await User.updateOne({ _id: user.id }, { $set: data });
  return json({ ok: true });
});
