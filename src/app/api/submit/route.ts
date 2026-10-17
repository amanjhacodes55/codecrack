import { z } from "zod";
import { withUser, error, json, rateLimit } from "@/lib/api";
import { enabledLanguages, judge } from "@/lib/runner";
import { clip, findVisibleProblem, verdictFromCode } from "@/lib/problems";
import { Problem } from "@/lib/models/Problem";
import { Submission } from "@/lib/models/Submission";
import { User } from "@/lib/models/User";
import type { LanguageId } from "@/lib/languages";

const Body = z.object({ slug: z.string(), language: z.string(), code: z.string().min(1).max(100_000) });

export const POST = withUser(async (req, _ctx, user) => {
  if (!rateLimit(`submit:${user.id}`, 12, 60_000)) return error("Too many submissions per minute. Take a breath!", 429);
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return error("Invalid request");
  const { slug, code } = parsed.data;
  const language = parsed.data.language as LanguageId;
  if (!enabledLanguages().includes(language)) return error("This language is not enabled yet.");

  const problem = await findVisibleProblem(slug, user, "+tests");
  if (!problem) return error("Problem not found", 404);
  if (!problem.tests.length) return error("This problem has no test cases yet.");

  const tests = problem.tests.map((t) => ({ input: t.input ?? "", output: t.output ?? "" }));
  const result = await judge({
    language,
    code,
    tests,
    timeLimitMs: problem.timeLimitMs,
    memoryMb: problem.memoryMb,
    stopOnFirstFail: true,
  });

  let verdictCode = "AC";
  let failed: Record<string, unknown> | undefined;
  let passed = 0;
  if (!result.compile.ok) {
    verdictCode = "CE";
  } else {
    for (let i = 0; i < result.results.length; i++) {
      const r = result.results[i];
      if (r.verdict === "AC") {
        passed++;
        continue;
      }
      verdictCode = r.verdict;
      const t = problem.tests[i];
      failed = {
        index: i + 1,
        sample: Boolean(t.sample),
        input: clip(t.input, 3000),
        expected: clip(t.output, 3000),
        output: clip(r.stdout, 3000),
        stderr: clip(r.stderr, 3000),
      };
      break;
    }
  }
  const verdict = verdictFromCode(verdictCode);
  const timeMs = Math.max(0, ...result.results.map((r) => r.timeMs));
  const memoryKb = Math.max(0, ...result.results.map((r) => r.memoryKb));

  const me = await User.findById(user.id).select("revealed").lean();
  const assisted = Boolean(me?.revealed?.some((id) => String(id) === String(problem._id)));
  const firstSolve =
    verdict === "Accepted" && !(await Submission.exists({ user: user.id, problem: problem._id, verdict: "Accepted" }));

  const sub = await Submission.create({
    user: user.id,
    problem: problem._id,
    slug,
    language,
    code,
    verdict,
    passed,
    total: tests.length,
    timeMs,
    memoryKb,
    failed,
    compileError: result.compile.ok ? "" : result.compile.message,
    assisted,
  });
  await Problem.updateOne(
    { _id: problem._id },
    { $inc: { "stats.submissions": 1, "stats.accepted": verdict === "Accepted" ? 1 : 0, "stats.solvedBy": firstSolve ? 1 : 0 } }
  );

  return json({
    id: String(sub._id),
    verdict,
    passed,
    total: tests.length,
    timeMs,
    memoryKb,
    failed: failed ?? null,
    compileError: sub.compileError,
    firstSolve,
    assisted,
  });
});
