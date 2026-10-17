export type Sample = { input: string; output: string; explanation?: string };

export type ProblemData = {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  companies: string[];
  collections: string[];
  source: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  samples: Sample[];
  hints: string[];
  timeLimitMs: number;
  memoryMb: number;
  starter: Record<string, string>;
  stats: { submissions: number; accepted: number; solvedBy: number };
  origin: string;
  status: string;
  hasEditorial: boolean;
  hasVideos: boolean;
  hasSolution: boolean;
};

export type RunResult = {
  input: string;
  expected: string | null;
  stdout: string;
  stderr: string;
  verdict: "AC" | "WA" | "TLE" | "MLE" | "RE" | "OLE" | "OK";
  timeMs: number;
  memoryKb: number;
};

export type RunResponse = { compile: { ok: boolean; message: string }; custom: boolean; results: RunResult[] };

export type SubmitResponse = {
  id: string;
  verdict: string;
  passed: number;
  total: number;
  timeMs: number;
  memoryKb: number;
  failed: { index: number; sample: boolean; input: string; expected: string; output: string; stderr: string } | null;
  compileError: string;
  firstSolve: boolean;
  assisted: boolean;
};

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

export const VERDICT_NAME: Record<string, string> = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  MLE: "Memory Limit Exceeded",
  RE: "Runtime Error",
  OLE: "Output Limit Exceeded",
  OK: "Finished",
};
