import { z } from "zod";

export const ProblemInput = z.object({
  title: z.string().trim().min(4, "Title is too short").max(120),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  companies: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  source: z.string().max(300).default(""),
  statement: z.string().trim().min(30, "Statement is too short").max(20_000),
  inputFormat: z.string().max(5000).default(""),
  outputFormat: z.string().max(5000).default(""),
  constraints: z.string().max(5000).default(""),
  samples: z
    .array(z.object({ input: z.string().max(10_000), output: z.string().max(10_000), explanation: z.string().max(3000).default("") }))
    .min(1, "Add at least one sample")
    .max(5),
  tests: z.array(z.object({ input: z.string().max(2_000_000), output: z.string().max(2_000_000) })).max(60).default([]),
  hints: z.array(z.string().max(1000)).max(5).default([]),
  editorial: z.string().max(20_000).default(""),
  youtube: z
    .array(z.object({ title: z.string().max(200), url: z.string().url().max(500), kind: z.enum(["video", "search"]).default("video") }))
    .max(5)
    .default([]),
  solution: z.string().max(50_000).default(""),
  starter: z.string().max(20_000).default(""),
  timeLimitMs: z.number().int().min(500).max(10_000).default(2000),
  submit: z.boolean().default(true), // false = save as draft
});

export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function toDoc(d: z.infer<typeof ProblemInput>) {
  return {
    title: d.title,
    difficulty: d.difficulty,
    tags: d.tags,
    companies: d.companies,
    source: d.source,
    statement: d.statement,
    inputFormat: d.inputFormat,
    outputFormat: d.outputFormat,
    constraints: d.constraints,
    samples: d.samples,
    tests: [
      ...d.samples.map((s) => ({ input: s.input, output: s.output, sample: true })),
      ...d.tests.map((t) => ({ input: t.input, output: t.output, sample: false })),
    ],
    hints: d.hints.filter((h) => h.trim()),
    editorial: d.editorial,
    youtube: d.youtube,
    solution: d.solution ? { python: d.solution } : {},
    starter: d.starter ? { python: d.starter } : {},
    timeLimitMs: d.timeLimitMs,
    status: d.submit ? "pending" : "draft",
  };
}
