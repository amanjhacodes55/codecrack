import { z } from "zod";
import { withUser, error, json, rateLimit } from "@/lib/api";
import { enabledLanguages, judge } from "@/lib/runner";
import { clip, findVisibleProblem } from "@/lib/problems";
import type { LanguageId } from "@/lib/languages";

const Body = z.object({
  slug: z.string(),
  language: z.string(),
  code: z.string().max(100_000),
  customInput: z.string().max(1_000_000).nullable().optional(),
});

export const POST = withUser(async (req, _ctx, user) => {
  if (!rateLimit(`run:${user.id}`, 40, 60_000)) return error("Slow down a little — too many runs per minute.", 429);
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  const { slug, code, customInput } = parsed.data;
  const language = parsed.data.language as LanguageId;
  if (!enabledLanguages().includes(language)) return error("This language is not enabled yet.");
  const problem = await findVisibleProblem(slug, user, "+solution");
  if (!problem) return error("Problem not found", 404);

  const custom = customInput !== null && customInput !== undefined;
  let tests: { input: string; output: string | null; explanation?: string }[] = custom
    ? [{ input: customInput, output: null }]
    : problem.samples.map((s) => ({ input: s.input ?? "", output: s.output ?? "" }));

  // For custom input, compute the expected answer using the reference solution (like LeetCode does).
  if (custom) {
    const ref = problem.solution?.get("python");
    if (ref) {
      const r = await judge({ language: "python", code: ref, tests: [{ input: customInput, output: null }], timeLimitMs: 10_000 });
      const res = r.results[0];
      if (r.compile.ok && res && res.verdict === "OK") tests = [{ input: customInput, output: res.stdout }];
    }
  }

  const result = await judge({ language, code, tests, timeLimitMs: problem.timeLimitMs, memoryMb: problem.memoryMb });
  return json({
    compile: result.compile,
    custom,
    results: result.results.map((r, i) => ({
      input: clip(tests[i].input, 20_000),
      expected: tests[i].output === null ? null : clip(tests[i].output, 20_000),
      stdout: r.stdout,
      stderr: r.stderr,
      // when we couldn't compute an expected answer, don't pretend it's accepted
      verdict: r.verdict,
      timeMs: r.timeMs,
      memoryKb: r.memoryKb,
    })),
  });
});
