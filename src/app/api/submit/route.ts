import { z } from "zod";
import { withUser, error, json, rateLimit } from "@/lib/api";
import { enabledLanguages, judge } from "@/lib/runner";
import { loadTests } from "@/lib/tests";
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

  const problem = await findVisibleProblem(slug, user, "+tests +testsGz");
  if (!problem) return error("Problem not found", 404);
  const allTests = loadTests(problem);
  if (!allTests.length) return error("This problem has no test cases yet.");

  const tests = allTests.map((t) => ({ input: t.input, output: t.output }));
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
      const t = allTests[i];
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
    compileError: result.compile.ok ? "" : clip(result.compile.message, 3000),
    assisted,
  });
  await pruneSubmissions(user.id, problem._id);
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

/**
 * Storage budget: keep only the newest KEEP submissions per user+problem, plus the first Accepted one
 * (it records when the problem was solved). Older attempts are deleted.
 */
const KEEP = 15;
async function pruneSubmissions(userId: string, problemId: unknown) {
  try {
    const firstAc = await Submission.findOne({ user: userId, problem: problemId, verdict: "Accepted" }).sort({ createdAt: 1 }).select("_id").lean();
    const old = await Submission.find({ user: userId, problem: problemId }).sort({ createdAt: -1 }).skip(KEEP).select("_id").lean();
    const ids = old.map((o) => o._id).filter((id) => String(id) !== String(firstAc?._id));
    if (ids.length) await Submission.deleteMany({ _id: { $in: ids } });
  } catch (e) {
    console.error("prune failed", e);
  }
}
