"use client";
import { safeFetch } from "@/lib/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Wand2, Send, Save } from "lucide-react";
import { useToast } from "@/components/Toast";
import MarkdownEditor from "@/components/discuss/MarkdownEditor";
import SimpleEditor from "@/components/SimpleEditor";

type IO = { input: string; output: string; explanation?: string };
export type ProblemFormValue = {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string;
  companies: string;
  source: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  samples: IO[];
  tests: IO[];
  hints: string[];
  editorial: string;
  youtube: { title: string; url: string; kind: "video" | "search" }[];
  solution: string;
  starter: string;
  timeLimitMs: number;
};

const STARTER = `import sys


def solve(n, arr):
    # Write your code here
    return 0


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    arr = list(map(int, data[1:1 + n]))
    print(solve(n, arr))


if __name__ == "__main__":
    main()
`;

export const EMPTY: ProblemFormValue = {
  title: "",
  difficulty: "Easy",
  tags: "",
  companies: "",
  source: "",
  statement: "",
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  samples: [{ input: "", output: "", explanation: "" }],
  tests: [{ input: "", output: "" }],
  hints: [""],
  editorial: "",
  youtube: [],
  solution: "",
  starter: STARTER,
  timeLimitMs: 2000,
};

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card space-y-4 p-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

export default function ProblemForm({ initial, slug }: { initial: ProblemFormValue; slug?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<ProblemFormValue>(initial);
  const [busy, setBusy] = useState<"" | "save" | "submit" | "fill">("");
  const [bulk, setBulk] = useState("");
  const set = <K extends keyof ProblemFormValue>(k: K, v: ProblemFormValue[K]) => setF((x) => ({ ...x, [k]: v }));

  async function fillOutputs() {
    if (!f.solution.trim()) return toast("Write the reference solution first.", "error");
    const all = [...f.samples, ...f.tests];
    if (all.some((t) => !t.input.trim())) return toast("Some test inputs are empty.", "error");
    setBusy("fill");
    const r = await safeFetch("/api/tools/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: f.solution, inputs: all.map((t) => t.input), timeLimitMs: Math.max(f.timeLimitMs, 4000) }),
    });
    const d = await r.json();
    setBusy("");
    if (!r.ok) return toast(d.error, "error");
    if (!d.compile.ok) return toast("Reference solution has an error: " + d.compile.message.slice(0, 200), "error");
    const bad = d.results.findIndex((x: { verdict: string }) => x.verdict !== "OK");
    if (bad >= 0) return toast(`Reference failed on test ${bad + 1}: ${d.results[bad].verdict} ${d.results[bad].stderr.slice(-150)}`, "error");
    const outs: string[] = d.results.map((x: { stdout: string }) => x.stdout);
    setF((x) => ({
      ...x,
      samples: x.samples.map((s, i) => ({ ...s, output: outs[i] })),
      tests: x.tests.map((t, i) => ({ ...t, output: outs[x.samples.length + i] })),
    }));
    toast("Expected outputs filled from your reference solution", "success");
  }

  async function save(submit: boolean) {
    setBusy(submit ? "submit" : "save");
    const body = {
      ...f,
      tags: f.tags.split(",").map((s) => s.trim()).filter(Boolean),
      companies: f.companies.split(",").map((s) => s.trim()).filter(Boolean),
      hints: f.hints.filter((h) => h.trim()),
      youtube: f.youtube.filter((y) => y.url.trim()),
      submit,
    };
    const r = await safeFetch(slug ? `/api/problems/${slug}` : "/api/problems", {
      method: slug ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setBusy("");
    if (!r.ok) return toast(d.error, "error");
    toast(submit ? "Submitted for review! Automated checks have run — see the results." : "Draft saved", "success");
    router.push("/contribute");
    router.refresh();
  }

  const ioList = (key: "samples" | "tests", label: string) => (
    <div className="space-y-3">
      {f[key].map((t, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
            {label} {i + 1}
            <button
              type="button"
              onClick={() => set(key, f[key].filter((_, j) => j !== i))}
              className="text-faint hover:text-danger"
              disabled={key === "samples" && f.samples.length === 1}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <textarea
              className="input min-h-[80px] font-mono text-xs"
              placeholder="stdin"
              value={t.input}
              onChange={(e) => set(key, f[key].map((x, j) => (j === i ? { ...x, input: e.target.value } : x)))}
            />
            <textarea
              className="input min-h-[80px] font-mono text-xs"
              placeholder="expected stdout (or fill from reference)"
              value={t.output}
              onChange={(e) => set(key, f[key].map((x, j) => (j === i ? { ...x, output: e.target.value } : x)))}
            />
          </div>
          {key === "samples" && (
            <input
              className="input mt-2 text-xs"
              placeholder="Explanation (optional, markdown)"
              value={t.explanation || ""}
              onChange={(e) => set(key, f[key].map((x, j) => (j === i ? { ...x, explanation: e.target.value } : x)))}
            />
          )}
        </div>
      ))}
      <button type="button" onClick={() => set(key, [...f[key], { input: "", output: "", explanation: "" }])} className="btn btn-secondary btn-sm">
        <Plus className="size-3.5" /> Add {label.toLowerCase()}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <Section title="Basics">
        <div>
          <label className="label">Title</label>
          <input className="input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Minimum Platforms" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={f.difficulty} onChange={(e) => set("difficulty", e.target.value as ProblemFormValue["difficulty"])}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="label">Topics (comma separated)</label>
            <input className="input" value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Arrays, Greedy" />
          </div>
          <div>
            <label className="label">Companies</label>
            <input className="input" value={f.companies} onChange={(e) => set("companies", e.target.value)} placeholder="Infosys, TCS" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <div>
            <label className="label">Source (where was it asked?)</label>
            <input className="input" value={f.source} onChange={(e) => set("source", e.target.value)} placeholder="Infosys SP on-campus, Aug 2026 (my own experience)" />
          </div>
          <div>
            <label className="label">Time limit (ms)</label>
            <input className="input" type="number" min={500} max={10000} step={500} value={f.timeLimitMs} onChange={(e) => set("timeLimitMs", Number(e.target.value))} />
          </div>
        </div>
      </Section>

      <Section title="Statement" desc="Markdown supported. Be precise: tie-breaking, indexing, output format.">
        <MarkdownEditor value={f.statement} onChange={(v) => set("statement", v)} minHeight={180} placeholder="You are given…" />
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="label">Input format</label>
            <textarea className="input min-h-[100px]" value={f.inputFormat} onChange={(e) => set("inputFormat", e.target.value)} />
          </div>
          <div>
            <label className="label">Output format</label>
            <textarea className="input min-h-[100px]" value={f.outputFormat} onChange={(e) => set("outputFormat", e.target.value)} />
          </div>
          <div>
            <label className="label">Constraints</label>
            <textarea className="input min-h-[100px]" value={f.constraints} onChange={(e) => set("constraints", e.target.value)} placeholder="- `1 ≤ N ≤ 10^5`" />
          </div>
        </div>
      </Section>

      <Section title="Reference solution (Python, required)" desc="Must read stdin and print to stdout. Admins verify it passes every test before approval.">
        <SimpleEditor value={f.solution} onChange={(v) => set("solution", v)} height={280} />
      </Section>

      <Section title="Test cases" desc="Samples are visible to users; hidden tests are used for judging (at least 5). Include edge cases and a few large inputs.">
        <h3 className="text-sm font-semibold">Samples</h3>
        {ioList("samples", "Sample")}
        <h3 className="pt-2 text-sm font-semibold">Hidden tests</h3>
        {ioList("tests", "Test")}
        <details className="rounded-lg border border-dashed border-border p-3">
          <summary className="cursor-pointer text-sm font-semibold">Bulk add hidden tests (paste many inputs at once)</summary>
          <p className="mt-2 text-xs text-muted">
            Paste several test inputs separated by a line containing only <code>---</code>. Then click &quot;Fill all expected outputs&quot; to compute the answers with your
            reference solution.
          </p>
          <textarea
            className="input mt-2 min-h-[120px] font-mono text-xs"
            placeholder={"5\n1 2 3 4 5\n---\n1\n7\n---\n3\n-1 -1 -1"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-2"
            onClick={() => {
              const inputs = bulk
                .split(/^---\s*$/m)
                .map((x) => x.replace(/^\n+|\s+$/g, "") + "\n")
                .filter((x) => x.trim());
              if (!inputs.length) return toast("Nothing to add", "error");
              set("tests", [...f.tests.filter((t) => t.input.trim()), ...inputs.map((input) => ({ input, output: "" }))]);
              setBulk("");
              toast(`Added ${inputs.length} test input(s) — now fill the expected outputs`, "success");
            }}
          >
            <Plus className="size-3.5" /> Add these tests
          </button>
        </details>
        <button type="button" onClick={fillOutputs} disabled={!!busy} className="btn btn-secondary">
          {busy === "fill" ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          Fill all expected outputs using my reference solution
        </button>
      </Section>

      <Section title="Starter code" desc="Do the input parsing for the user, leave the core function empty.">
        <SimpleEditor value={f.starter} onChange={(v) => set("starter", v)} height={240} />
      </Section>

      <Section title="Learning material (hidden until users reveal it)">
        <div className="space-y-2">
          <label className="label">Hints (progressive)</label>
          {f.hints.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" value={h} onChange={(e) => set("hints", f.hints.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Hint ${i + 1}`} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("hints", f.hints.filter((_, j) => j !== i))}>
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {f.hints.length < 5 && (
            <button type="button" onClick={() => set("hints", [...f.hints, ""])} className="btn btn-secondary btn-sm">
              <Plus className="size-3.5" /> Add hint
            </button>
          )}
        </div>
        <div>
          <label className="label">Editorial</label>
          <MarkdownEditor value={f.editorial} onChange={(v) => set("editorial", v)} placeholder="Intuition, approach, complexity, common mistakes" />
        </div>
        <div className="space-y-2">
          <label className="label">YouTube explanations</label>
          {f.youtube.map((y, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input className="input" placeholder="Title" value={y.title} onChange={(e) => set("youtube", f.youtube.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <input className="input" placeholder="https://www.youtube.com/watch?v=…" value={y.url} onChange={(e) => set("youtube", f.youtube.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("youtube", f.youtube.filter((_, j) => j !== i))}>
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set("youtube", [...f.youtube, { title: "", url: "", kind: "video" }])} className="btn btn-secondary btn-sm">
            <Plus className="size-3.5" /> Add video
          </button>
        </div>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end gap-2 border-t border-border bg-bg/90 px-4 py-3 backdrop-blur">
        <button onClick={() => save(false)} disabled={!!busy} className="btn btn-secondary">
          {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save draft
        </button>
        <button onClick={() => save(true)} disabled={!!busy} className="btn btn-primary">
          {busy === "submit" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit for review
        </button>
      </div>
    </div>
  );
}
