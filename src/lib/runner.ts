import "server-only";
import { spawn } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import type { LanguageId } from "@/lib/languages";

const PYTHON = process.env.PYTHON_BIN || "python3";
const RUNNER_DIR = path.join(process.cwd(), "runner");
const CONCURRENCY = Math.max(1, Number(process.env.RUNNER_CONCURRENCY || 4));
// "local" runs user code directly with rlimits (fine for personal use on your own machine).
// "docker" runs it in a throwaway container: no network, read-only FS, capped memory/CPU/PIDs, nobody user.
const SANDBOX = process.env.RUNNER_SANDBOX === "docker" ? "docker" : "local";
const IMAGE = process.env.RUNNER_IMAGE || "python:3.12-slim";
const WALL_FACTOR = Number(process.env.JUDGE_WALL_FACTOR || 2);

function dockerArgs(extraMounts: string[], cmd: string[]) {
  return [
    "run", "--rm", "-i",
    "--network", "none",
    "--memory", "1g", "--memory-swap", "1g",
    "--cpus", "1",
    "--pids-limit", "256",
    "--read-only",
    "--tmpfs", "/tmp:rw,exec,size=128m",
    "--user", "65534:65534",
    "--security-opt", "no-new-privileges",
    "-v", `${RUNNER_DIR}:/runner:ro`,
    ...extraMounts,
    IMAGE,
    ...cmd,
  ];
}

function userProcessLimit() {
  // RLIMIT_NPROC is per OS user: allow a small margin above the current count (blocks fork bombs).
  try {
    const uid = process.getuid?.() ?? 0;
    let n = 0;
    for (const pid of readdirSync("/proc")) {
      if (!/^\d+$/.test(pid)) continue;
      try {
        if (statSync(`/proc/${pid}`).uid === uid) n += readdirSync(`/proc/${pid}/task`).length; // threads count too
      } catch {}
    }
    return n + 48;
  } catch {
    return 4096;
  }
}

export function enabledLanguages(): LanguageId[] {
  const list = (process.env.ENABLED_LANGUAGES || "python")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as LanguageId[];
  return list.length ? list : ["python"];
}

// ---- tiny semaphore so a burst of submissions can't fork-bomb the machine ----
let active = 0;
const waiting: Array<() => void> = [];
async function acquire() {
  if (active < CONCURRENCY) {
    active++;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
  active++;
}
function release() {
  active--;
  waiting.shift()?.();
}

function runProcess(cmd: string, args: string[], stdin: string, timeoutMs: number) {
  return new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve, reject) => {
    // Never hand server secrets (DB URL, auth secret, OAuth keys) to the judge / user code.
    const env: Record<string, string> = { PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin", LANG: "C.UTF-8", HOME: os.tmpdir(), JUDGE_WALL_FACTOR: String(WALL_FACTOR) };
    if (process.env.DOCKER_HOST) env.DOCKER_HOST = process.env.DOCKER_HOST;
    const child = spawn(cmd, args, { cwd: RUNNER_DIR, stdio: ["pipe", "pipe", "pipe"], env: env as unknown as NodeJS.ProcessEnv });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => err.push(d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout: Buffer.concat(out).toString("utf8"), stderr: Buffer.concat(err).toString("utf8"), code });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(stdin);
  });
}

export type TestVerdict = "AC" | "WA" | "TLE" | "MLE" | "RE" | "OLE" | "OK";
export type TestResult = {
  verdict: TestVerdict;
  timeMs: number;
  memoryKb: number;
  stdout: string;
  stderr: string;
  exitCode: number;
};
export type JudgeResult = { compile: { ok: boolean; message: string }; results: TestResult[] };

export async function judge(job: {
  language: LanguageId;
  code: string;
  tests: { input: string; output: string | null }[];
  timeLimitMs: number;
  memoryMb?: number;
  stopOnFirstFail?: boolean;
}): Promise<JudgeResult> {
  await acquire();
  try {
    const budget = job.tests.length * (job.timeLimitMs * WALL_FACTOR + 1500) + 40_000;
    const { stdout, stderr } =
      SANDBOX === "docker"
        ? await runProcess("docker", dockerArgs([], ["python3", "-I", "/runner/judge.py"]), JSON.stringify(job), budget + 15_000)
        : await runProcess(PYTHON, ["-I", "judge.py"], JSON.stringify(job), budget);
    try {
      return JSON.parse(stdout) as JudgeResult;
    } catch {
      throw new Error("Judge failed: " + (stderr || stdout).slice(0, 500));
    }
  } finally {
    release();
  }
}

export type TraceValue = { t: string; v: string; n?: number };
export type TraceStep = {
  line: number;
  event: "line" | "call" | "return" | "exception";
  func: string;
  stack: { func: string; line: number; locals: Record<string, TraceValue> }[];
  out: number;
  ret: TraceValue | null;
  exc: string | null;
};
export type TraceResult = {
  steps: TraceStep[];
  stdout: string;
  error: { line: number | null; message: string; traceback: string } | null;
  truncated: boolean;
};

export async function trace(code: string, input: string, maxSteps = 4000): Promise<TraceResult> {
  await acquire();
  const dir = await mkdtemp(path.join(os.tmpdir(), "cc-trace-"));
  try {
    const jobPath = path.join(dir, "job.json");
    const resPath = path.join(dir, "result.json");
    await writeFile(jobPath, JSON.stringify({ code, input, maxSteps }));
    const res =
      SANDBOX === "docker"
        ? await (async () => {
            await chmod(dir, 0o777);
            return runProcess(
              "docker",
              dockerArgs(["-v", `${dir}:/work`], ["timeout", "-s", "KILL", "12", "python3", "-I", "/runner/tracer.py", "/work/job.json", "/work/result.json"]),
              "",
              30_000
            );
          })()
        : await runProcess(
            "prlimit",
            ["--as=1073741824", "--cpu=10", "--fsize=67108864", `--nproc=${userProcessLimit()}`, PYTHON, "-I", "tracer.py", jobPath, resPath],
            "",
            15_000 * Math.max(1, WALL_FACTOR / 2)
          );
    try {
      return JSON.parse(await readFile(resPath, "utf8")) as TraceResult;
    } catch {
      const hint = res.code === null ? "Debugger timed out (infinite loop?)." : res.stderr.slice(-500);
      return { steps: [], stdout: "", error: { line: null, message: hint || "Debugger crashed", traceback: hint }, truncated: false };
    }
  } finally {
    release();
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

export const VERDICT_LABEL: Record<string, string> = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  RE: "Runtime Error",
  OLE: "Output Limit Exceeded",
  CE: "Compilation Error",
};
