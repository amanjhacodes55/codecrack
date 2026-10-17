import "server-only";
import { judge } from "@/lib/runner";
import { Problem } from "@/lib/models/Problem";

export type Check = { name: string; ok: boolean; detail: string; severity: "error" | "warn" };

type P = {
  _id: unknown;
  slug: string;
  title: string;
  statement: string;
  inputFormat?: string | null;
  outputFormat?: string | null;
  constraints?: string | null;
  samples: { input?: string | null; output?: string | null }[];
  tests: { input?: string | null; output?: string | null; sample?: boolean | null }[];
  solution?: Map<string, string> | null;
  starter?: Map<string, string> | null;
  timeLimitMs: number;
  memoryMb: number;
};

/** Automated verification run before an admin approves a community problem. */
export async function runChecks(p: P): Promise<Check[]> {
  const checks: Check[] = [];
  const add = (name: string, ok: boolean, detail: string, severity: "error" | "warn" = "error") =>
    checks.push({ name, ok, detail: ok ? detail || "OK" : detail, severity });

  add(
    "Statement complete",
    p.statement.trim().length >= 60 && !!p.inputFormat?.trim() && !!p.outputFormat?.trim() && !!p.constraints?.trim(),
    p.statement.trim().length < 60
      ? "Statement is shorter than 60 characters."
      : "Statement, input format, output format and constraints are present."
  );
  if (checks[0].ok === false && checks[0].detail.startsWith("Statement, ")) checks[0].detail = "Input/output format or constraints missing.";

  const dup = await Problem.findOne({
    _id: { $ne: p._id },
    status: "approved",
    title: { $regex: `^${p.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  })
    .select("slug")
    .lean();
  add("Unique title", !dup, dup ? `An approved problem already uses this title (/problems/${dup.slug}).` : "No duplicate title.");

  add("Has samples", p.samples.length >= 1, p.samples.length ? `${p.samples.length} sample(s).` : "At least one sample is required.");
  const hidden = p.tests.filter((t) => !t.sample).length;
  add("Enough hidden tests", hidden >= 5, `${hidden} hidden test(s)${hidden < 5 ? " — need at least 5." : "."}`);
  const outputs = new Set(p.tests.map((t) => (t.output || "").trim()));
  add(
    "Tests are diverse",
    p.tests.length < 3 || outputs.size > 1,
    outputs.size <= 1 ? "All tests have the same expected output — a constant print would pass." : `${outputs.size} distinct expected outputs.`,
    "warn"
  );

  const ref = p.solution?.get("python");
  add("Reference solution provided", !!ref?.trim(), ref ? "Python reference present." : "A Python reference solution is required.");

  if (ref?.trim() && p.tests.length) {
    const all = [
      ...p.samples.map((s) => ({ input: s.input || "", output: s.output || "" })),
      ...p.tests.filter((t) => !t.sample).map((t) => ({ input: t.input || "", output: t.output || "" })),
    ];
    const r = await judge({ language: "python", code: ref, tests: all, timeLimitMs: p.timeLimitMs, memoryMb: p.memoryMb });
    if (!r.compile.ok) {
      add("Reference passes all tests", false, "Reference solution has a syntax error:\n" + r.compile.message);
    } else {
      const badIdx = r.results.findIndex((x) => x.verdict !== "AC");
      const nSamples = p.samples.length;
      add(
        "Reference passes all tests",
        badIdx === -1,
        badIdx === -1
          ? `Passed ${all.length}/${all.length} (samples + hidden).`
          : `${badIdx < nSamples ? "Sample" : "Hidden test"} #${badIdx < nSamples ? badIdx + 1 : badIdx - nSamples + 1}: ${r.results[badIdx].verdict}. Expected "${all[badIdx].output.slice(0, 80)}", got "${r.results[badIdx].stdout.slice(0, 80)}"`
      );
      const slow = Math.max(0, ...r.results.map((x) => x.timeMs));
      add(
        "Reference is fast enough",
        slow <= p.timeLimitMs * 0.5,
        `Slowest test took ${slow} ms (limit ${p.timeLimitMs} ms; reference should use ≤ 50%).`,
        "warn"
      );
    }
  }

  const starter = p.starter?.get("python");
  if (starter?.trim() && p.samples.length) {
    const r = await judge({
      language: "python",
      code: starter,
      tests: p.samples.map((s) => ({ input: s.input || "", output: s.output || "" })),
      timeLimitMs: p.timeLimitMs,
    });
    add("Starter code compiles", r.compile.ok, r.compile.ok ? "Starter code is valid Python." : r.compile.message);
    const solves = r.compile.ok && r.results.every((x) => x.verdict === "AC");
    add("Starter does not leak the answer", !solves, solves ? "The starter code already passes all samples!" : "Starter does not solve samples.", "warn");
  } else {
    add("Starter code compiles", true, "No starter given — the default template will be used.", "warn");
  }

  const size = JSON.stringify(p.tests).length;
  add("Test data size", size < 8_000_000, `${(size / 1e6).toFixed(2)} MB of test data.`);
  return checks;
}

export function checksPass(checks: Check[]) {
  return checks.every((c) => c.ok || c.severity === "warn");
}
