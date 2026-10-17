import { z } from "zod";
import { withUser, error, json, rateLimit } from "@/lib/api";
import { trace } from "@/lib/runner";

const Body = z.object({ code: z.string().max(50_000), input: z.string().max(200_000), language: z.string().default("python") });

export const POST = withUser(async (req, _ctx, user) => {
  if (!rateLimit(`debug:${user.id}`, 30, 60_000)) return error("Too many debug sessions per minute.", 429);
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  if (parsed.data.language !== "python") return error("The step debugger currently supports Python only.");
  return json(await trace(parsed.data.code, parsed.data.input));
});
