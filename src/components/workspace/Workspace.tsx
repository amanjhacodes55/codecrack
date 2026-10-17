"use client";
import { safeFetch } from "@/lib/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import clsx from "clsx";
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  FileText,
  BookOpen,
  Code2,
  PlayCircle,
  History,
  MessagesSquare,
  NotebookPen,
  Play,
  RotateCcw,
  Loader2,
  Minus,
  Plus,
  List,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { LANGUAGES, DEFAULT_STARTERS, type LanguageId } from "@/lib/languages";
import CodeEditor from "./CodeEditor";
import DescriptionTab from "./DescriptionTab";
import RevealTab from "./RevealTabs";
import SubmissionsTab from "./SubmissionsTab";
import NotesTab from "./NotesTab";
import ConsolePanel, { type ConsoleTab } from "./ConsolePanel";
import DebuggerPanel from "./DebuggerPanel";
import Stopwatch from "./Stopwatch";
import DiscussionList from "@/components/discuss/DiscussionList";
import DiscussionThread from "@/components/discuss/DiscussionThread";
import type { ProblemData, RunResponse, SubmitResponse, TraceResult } from "./types";

type LeftTab = "description" | "editorial" | "solution" | "videos" | "submissions" | "discuss" | "notes";

type Props = {
  problem: ProblemData;
  me: { id: string; role: string; name: string } | null;
  languages: LanguageId[];
  preferredLanguage: string;
  drafts: Record<string, { code: string; updatedAt: string }>;
  note: string;
  bookmarked: boolean;
  solved: boolean;
  prev: string | null;
  next: string | null;
};

const LS_KEY = (slug: string, lang: string) => `cc-code:${slug}:${lang}`;

function readLocal(slug: string, lang: string): { code: string; t: number } | null {
  try {
    const raw = localStorage.getItem(LS_KEY(slug, lang));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Workspace(props: Props) {
  const { problem, me } = props;
  const toast = useToast();
  const signedIn = !!me;

  const [leftTab, setLeftTab] = useState<LeftTab>("description");
  const [thread, setThread] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageId>(
    props.languages.includes(props.preferredLanguage as LanguageId) ? (props.preferredLanguage as LanguageId) : props.languages[0]
  );
  const starterFor = useCallback((lang: string) => problem.starter[lang] || DEFAULT_STARTERS[lang as LanguageId] || "", [problem.starter]);

  const initialCode = useCallback(
    (lang: string) => {
      const server = props.drafts[lang];
      const local = typeof window !== "undefined" ? readLocal(problem.slug, lang) : null;
      if (server && local) return new Date(server.updatedAt).getTime() >= local.t ? server.code : local.code;
      return server?.code ?? local?.code ?? starterFor(lang);
    },
    [props.drafts, problem.slug, starterFor]
  );

  const [code, setCode] = useState<string>(() => props.drafts[language]?.code ?? starterFor(language));
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setCode(initialCode(language));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [fontSize, setFontSize] = useState(14);
  useEffect(() => {
    try {
      const f = Number(localStorage.getItem("cc-font"));
      if (f) setFontSize(f);
    } catch {}
  }, []);
  const changeFont = (d: number) => {
    const f = Math.min(24, Math.max(11, fontSize + d));
    setFontSize(f);
    try {
      localStorage.setItem("cc-font", String(f));
    } catch {}
  };

  // ---- autosave: localStorage immediately, server debounced ----
  const [saveState, setSaveState] = useState<"saved" | "saving" | "local">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY(problem.slug, language), JSON.stringify({ code, t: Date.now() }));
    } catch {}
    if (!signedIn) {
      setSaveState("local");
      return;
    }
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await safeFetch("/api/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: problem.slug, language, code }),
      }).catch(() => {});
      setSaveState("saved");
    }, 1500);
  }, [code, language, hydrated, signedIn, problem.slug]);

  // ---- console / run / submit ----
  const [consoleTab, setConsoleTab] = useState<ConsoleTab>("testcases");
  const [selected, setSelected] = useState(0);
  const [customInput, setCustomInput] = useState(problem.samples[0]?.input ?? "");
  const [busy, setBusy] = useState<"run" | "submit" | "debug" | null>(null);
  const [runRes, setRunRes] = useState<RunResponse | null>(null);
  const [subRes, setSubRes] = useState<SubmitResponse | null>(null);
  const [subsKey, setSubsKey] = useState(0);
  const [solved, setSolved] = useState(props.solved);
  const [stats, setStats] = useState(problem.stats);

  const needLogin = () => {
    toast("Sign in to run and submit code — it's free.", "info");
    return false;
  };

  async function run() {
    if (!signedIn) return needLogin();
    if (busy) return;
    setBusy("run");
    setConsoleTab("result");
    setSubRes(null);
    try {
      const r = await safeFetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: problem.slug, language, code, customInput: selected === -1 ? customInput : null }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setRunRes(d);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Run failed", "error");
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!signedIn) return needLogin();
    if (busy) return;
    setBusy("submit");
    setConsoleTab("result");
    setRunRes(null);
    try {
      const r = await safeFetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: problem.slug, language, code }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSubRes(d);
      setSubsKey((k) => k + 1);
      setStats((st) => ({
        submissions: st.submissions + 1,
        accepted: st.accepted + (d.verdict === "Accepted" ? 1 : 0),
        solvedBy: st.solvedBy + (d.firstSolve ? 1 : 0),
      }));
      if (d.verdict === "Accepted") {
        setSolved(true);
        toast(d.firstSolve ? `Solved ${problem.title}! 🎉` : "Accepted again ✔", "success");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Submit failed", "error");
    } finally {
      setBusy(null);
    }
  }

  // ---- debugger ----
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const debugging = trace !== null;

  const toggleBreakpoint = useCallback((line: number) => {
    setBreakpoints((b) => {
      const n = new Set(b);
      if (n.has(line)) n.delete(line);
      else n.add(line);
      return n;
    });
  }, []);

  async function startDebug(input?: string) {
    if (!signedIn) return needLogin();
    if (language !== "python") {
      toast("The step debugger supports Python for now.", "info");
      return;
    }
    if (busy) return;
    const stdin = input ?? (selected === -1 ? customInput : problem.samples[selected]?.input ?? "");
    if (input !== undefined) {
      setSelected(-1);
      setCustomInput(input);
    }
    setBusy("debug");
    try {
      const r = await safeFetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input: stdin, language }),
      });
      const d: TraceResult & { error?: unknown } = await r.json();
      if (!r.ok) throw new Error((d as unknown as { error: string }).error);
      setTrace(d);
      // Start at the first breakpoint if any, otherwise at the first line.
      const firstBp = d.steps.findIndex((s) => s.event === "line" && breakpoints.has(s.line));
      setStepIdx(firstBp >= 0 ? firstBp : 0);
      setConsoleTab("debugger");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Debugger failed", "error");
    } finally {
      setBusy(null);
    }
  }

  const stopDebug = () => {
    setTrace(null);
    setConsoleTab("testcases");
  };

  const curStep = trace?.steps[stepIdx];
  const errorLine = trace && stepIdx >= trace.steps.length - 1 ? trace.error?.line ?? null : null;

  // keyboard shortcuts while debugging (F5 continue, F10 over, F11 into)
  // stacked layout on phones / narrow windows
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    if (!debugging) return;
    const onKey = (e: KeyboardEvent) => {
      if (!["F5", "F10", "F11"].includes(e.key) || !trace) return;
      e.preventDefault();
      const steps = trace.steps;
      const d = curStep?.stack.length ?? 0;
      const find = (pred: (i: number) => boolean) => {
        for (let i = stepIdx + 1; i < steps.length; i++) if (pred(i)) return i;
        return steps.length - 1;
      };
      if (e.key === "F11") setStepIdx(find((i) => steps[i].event === "line"));
      if (e.key === "F10") setStepIdx(find((i) => steps[i].event === "line" && steps[i].stack.length <= d));
      if (e.key === "F5") setStepIdx(find((i) => steps[i].event === "line" && breakpoints.has(steps[i].line)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [debugging, trace, stepIdx, curStep, breakpoints]);

  function changeLanguage(l: LanguageId) {
    setLanguage(l);
    setCode(initialCode(l));
    if (debugging) stopDebug();
  }

  function resetCode() {
    if (!confirm("Reset to the starter code? Your current code for this language will be replaced.")) return;
    setCode(starterFor(language));
  }

  async function toggleBookmark() {
    if (!signedIn) return needLogin();
    const r = await safeFetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: problem.slug }) });
    const d = await r.json();
    setBookmarked(d.bookmarked);
    toast(d.bookmarked ? "Bookmarked" : "Bookmark removed", "success");
  }
  const [bookmarked, setBookmarked] = useState(props.bookmarked);

  const tabs: { id: LeftTab; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      { id: "description", label: "Description", icon: <FileText className="size-3.5" /> },
      { id: "editorial", label: "Editorial", icon: <BookOpen className="size-3.5" /> },
      { id: "solution", label: "Solution", icon: <Code2 className="size-3.5" /> },
      { id: "videos", label: "Videos", icon: <PlayCircle className="size-3.5" /> },
      { id: "submissions", label: "Submissions", icon: <History className="size-3.5" /> },
      { id: "discuss", label: "Discuss", icon: <MessagesSquare className="size-3.5" /> },
      { id: "notes", label: "Notes", icon: <NotebookPen className="size-3.5" /> },
    ],
    []
  );


  const leftNode = (
    <>
          <div className="flex shrink-0 overflow-x-auto border-b border-border px-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setLeftTab(t.id);
                  if (t.id === "discuss") setThread(null);
                }}
                className={clsx(
                  "relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium",
                  leftTab === t.id ? "text-text" : "text-muted hover:text-text"
                )}
              >
                {t.icon}
                {t.label}
                {leftTab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {leftTab === "description" && <DescriptionTab problem={{ ...problem, stats }} solved={solved} bookmarked={bookmarked} onBookmark={toggleBookmark} />}
            {leftTab === "editorial" && <RevealTab key="e" kind="editorial" slug={problem.slug} available={problem.hasEditorial} signedIn={signedIn} />}
            {leftTab === "solution" && <RevealTab key="s" kind="solution" slug={problem.slug} available={problem.hasSolution} signedIn={signedIn} />}
            {leftTab === "videos" && <RevealTab key="v" kind="videos" slug={problem.slug} available={problem.hasVideos} signedIn={signedIn} />}
            {leftTab === "submissions" && (
              <SubmissionsTab
                slug={problem.slug}
                signedIn={signedIn}
                refreshKey={subsKey}
                onLoadCode={(c, l) => {
                  if (props.languages.includes(l as LanguageId)) setLanguage(l as LanguageId);
                  setCode(c);
                  toast("Loaded into editor", "success");
                }}
              />
            )}
            {leftTab === "discuss" &&
              (thread ? (
                <DiscussionThread id={thread} me={me} onBack={() => setThread(null)} />
              ) : (
                <DiscussionList slug={problem.slug} signedIn={signedIn} onOpen={setThread} />
              ))}
            {leftTab === "notes" && <NotesTab slug={problem.slug} initial={props.note} signedIn={signedIn} />}
          </div>
    </>
  );
  const editorNode = (
    <>
              <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-2">
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value as LanguageId)}
                  className="rounded-md bg-transparent px-2 py-1 text-sm font-semibold outline-none hover:bg-surface-2"
                  disabled={debugging}
                >
                  {props.languages.map((l) => (
                    <option key={l} value={l}>
                      {LANGUAGES[l].label}
                    </option>
                  ))}
                </select>
                {props.languages.length === 1 && <span className="hidden text-xs text-faint lg:inline">Java &amp; C++ coming soon</span>}
                {debugging && (
                  <span className="rounded bg-yellow-400/15 px-2 py-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-300">
                    DEBUG MODE — editor is read-only
                  </span>
                )}
                <div className="ml-auto flex items-center gap-0.5 text-muted">
                  <span className="mr-2 text-xs text-faint">
                    {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Saved locally"}
                  </span>
                  <button onClick={() => changeFont(-1)} className="btn btn-ghost btn-sm !p-1.5" title="Smaller font">
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs">{fontSize}</span>
                  <button onClick={() => changeFont(1)} className="btn btn-ghost btn-sm !p-1.5" title="Bigger font">
                    <Plus className="size-3.5" />
                  </button>
                  <button onClick={resetCode} className="btn btn-ghost btn-sm !p-1.5" title="Reset to starter code" disabled={debugging}>
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1">
                <CodeEditor
                  value={code}
                  language={LANGUAGES[language].monaco}
                  onChange={setCode}
                  fontSize={fontSize}
                  readOnly={debugging}
                  breakpoints={breakpoints}
                  onToggleBreakpoint={toggleBreakpoint}
                  currentLine={curStep?.line ?? null}
                  errorLine={errorLine}
                  onRun={run}
                  onSubmit={submit}
                />
              </div>
    </>
  );
  const consoleNode = (
              <div className="h-full">
                <ConsolePanel
                  tab={consoleTab}
                  setTab={setConsoleTab}
                  samples={problem.samples}
                  selected={selected}
                  setSelected={setSelected}
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                  busy={busy}
                  run={runRes}
                  submit={subRes}
                  debugging={debugging}
                  onDebugInput={(inp) => startDebug(inp)}
                  nextSlug={props.next}
                  debuggerNode={
                    trace && (
                      <DebuggerPanel trace={trace} index={stepIdx} setIndex={setStepIdx} breakpoints={breakpoints} onStop={stopDebug} />
                    )
                  }
                />
              </div>
  );

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-bg">
      {/* top action bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-surface px-3">
        <Link href="/problems" className="btn btn-ghost btn-sm !px-2" title="Problem list">
          <List className="size-4" /> <span className="hidden sm:inline">Problems</span>
        </Link>
        <div className="flex">
          <Link
            href={props.prev ? `/problems/${props.prev}` : "#"}
            aria-disabled={!props.prev}
            className={clsx("btn btn-ghost btn-sm !p-1.5", !props.prev && "pointer-events-none opacity-30")}
            title="Previous problem"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href={props.next ? `/problems/${props.next}` : "#"}
            aria-disabled={!props.next}
            className={clsx("btn btn-ghost btn-sm !p-1.5", !props.next && "pointer-events-none opacity-30")}
            title="Next problem"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <span className="hidden truncate text-sm font-semibold md:block">{problem.title}</span>
        <Stopwatch slug={problem.slug} />

        <div className="ml-auto flex items-center gap-2">
          {debugging ? (
            <button onClick={stopDebug} className="btn btn-secondary btn-sm !border-yellow-500/50 !text-yellow-600 dark:!text-yellow-300">
              <Bug className="size-3.5" /> Exit debug
            </button>
          ) : (
            <button onClick={() => startDebug()} disabled={!!busy} className="btn btn-secondary btn-sm" title="Step through your code (Python)">
              {busy === "debug" ? <Loader2 className="size-3.5 animate-spin" /> : <Bug className="size-3.5 text-yellow-500" />}
              Debug
            </button>
          )}
          <button onClick={run} disabled={!!busy} className="btn btn-secondary btn-sm" title="Run on selected test case (Ctrl+')">
            {busy === "run" ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Run
          </button>
          <button onClick={submit} disabled={!!busy} className="btn btn-primary btn-sm" title="Submit (Ctrl+Enter)">
            {busy === "submit" ? <Loader2 className="size-3.5 animate-spin" /> : <CloudUpload className="size-3.5" />}
            Submit
          </button>
        </div>
      </div>

      {narrow ? (
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-1.5">
          <div className="flex h-[70vh] flex-col overflow-hidden rounded-lg border border-border bg-surface">{leftNode}</div>
          <div className="flex h-[65vh] flex-col overflow-hidden rounded-lg border border-border bg-surface">{editorNode}</div>
          <div className="h-[60vh] overflow-hidden rounded-lg border border-border">{consoleNode}</div>
        </div>
      ) : (
        <PanelGroup direction="horizontal" autoSaveId="cc-ws-h" className="min-h-0 flex-1 p-1.5">
          <Panel defaultSize={44} minSize={25} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface">
            {leftNode}
          </Panel>
          <PanelResizeHandle className="group flex w-1.5 items-center justify-center">
            <div className="h-8 w-0.5 rounded-full bg-border group-hover:bg-brand group-data-[resize-handle-state=drag]:bg-brand" />
          </PanelResizeHandle>
          <Panel defaultSize={56} minSize={30} className="min-w-0">
            <PanelGroup direction="vertical" autoSaveId="cc-ws-v">
              <Panel defaultSize={62} minSize={20} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
                {editorNode}
              </Panel>
              <PanelResizeHandle className="group flex h-1.5 items-center justify-center">
                <div className="h-0.5 w-8 rounded-full bg-border group-hover:bg-brand group-data-[resize-handle-state=drag]:bg-brand" />
              </PanelResizeHandle>
              <Panel defaultSize={38} minSize={12} className="overflow-hidden rounded-lg border border-border">
                {consoleNode}
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
}
