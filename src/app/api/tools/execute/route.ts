import { z } from "zod";
import { withUser, error, json, rateLimit } from "@/lib/api";
import { judge } from "@/lib/runner";

// Used by the problem authoring form: run the author's reference solution to fill expected outputs.
const Body = z.object({ code: z.string().min(1).max(50_000), inputs: z.array(z.string().max(2_000_000)).min(1).max(60), timeLimitMs: z.number().int().min(500).max(10_000).default(4000) });

export const POST = withUser(async (req, _ctx, user) => {
  if (!rateLimit(`exec:${user.id}`, 20, 60_000)) return error("Too many runs, wait a minute.", 429);
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  const r = await judge({
    language: "python",
    code: parsed.data.code,
    tests: parsed.data.inputs.map((input) => ({ input, output: null })),
    timeLimitMs: parsed.data.timeLimitMs,
  });
  return json({
    compile: r.compile,
    results: r.results.map((x) => ({ verdict: x.verdict, stdout: x.stdout, stderr: x.stderr.slice(0, 2000), timeMs: x.timeMs })),
  });
});
