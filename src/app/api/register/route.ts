import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { error, json, rateLimit } from "@/lib/api";
import { initialRole, uniqueUsername } from "@/lib/users";

const Body = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "Username: 3–20 letters, digits or _")
    .optional()
    .or(z.literal("")),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`register:${ip}`, 10, 60 * 60 * 1000)) return error("Too many sign-ups, try later.", 429);
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return error(parsed.error.issues[0].message);
  const { name, email, password, username } = parsed.data;
  await dbConnect();
  if (await User.exists({ email })) return error("An account with this email already exists. Sign in instead.");
  let handle = username || "";
  if (handle) {
    if (await User.exists({ username: handle })) return error("That username is taken.");
  } else {
    handle = await uniqueUsername(email);
  }
  await User.create({
    name,
    email,
    username: handle,
    passwordHash: await bcrypt.hash(password, 10),
    providers: ["credentials"],
    role: await initialRole(email),
  });
  return json({ ok: true });
}
