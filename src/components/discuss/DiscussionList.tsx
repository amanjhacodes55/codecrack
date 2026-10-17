"use client";
import { safeFetch } from "@/lib/client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowBigUp, Eye, Loader2, MessageSquare, Pin, Plus } from "lucide-react";
import { Avatar, EmptyState, timeAgo } from "@/components/ui";
import { useToast } from "@/components/Toast";
import MarkdownEditor from "./MarkdownEditor";

export type DiscussionItem = {
  id: string;
  title: string;
  kind: string;
  preview: string;
  score: number;
  upvoted: boolean;
  commentCount: number;
  views: number;
  pinned: boolean;
  createdAt: string;
  author: { name: string; username: string; image?: string } | null;
  problem?: { slug: string; title: string } | null;
};

const KINDS: Record<string, { label: string; cls: string }> = {
  question: { label: "Question", cls: "bg-info-soft text-info" },
  solution: { label: "Solution", cls: "bg-brand-soft text-brand" },
  tip: { label: "Tip", cls: "bg-warn-soft text-warn" },
  general: { label: "General", cls: "bg-surface-3 text-muted" },
};

export function KindBadge({ kind }: { kind: string }) {
  const k = KINDS[kind] || KINDS.general;
  return <span className={clsx("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", k.cls)}>{k.label}</span>;
}

export default function DiscussionList({
  slug,
  signedIn,
  onOpen,
  showProblem = false,
}: {
  slug?: string;
  signedIn: boolean;
  onOpen?: (id: string) => void;
  showProblem?: boolean;
}) {
  const toast = useToast();
  const [items, setItems] = useState<DiscussionItem[] | null>(null);
  const [sort, setSort] = useState("top");
  const [kind, setKind] = useState("");
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", kind: "question" });
  const [posting, setPosting] = useState(false);

  const load = useCallback(() => {
    const u = new URLSearchParams({ sort });
    if (slug) u.set("slug", slug);
    if (kind) u.set("kind", kind);
    safeFetch(`/api/discussions?${u}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, [slug, sort, kind]);
  useEffect(load, [load]);

  async function post() {
    setPosting(true);
    const r = await safeFetch("/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug }),
    });
    const d = await r.json();
    setPosting(false);
    if (!r.ok) return toast(d.error, "error");
    toast("Posted!", "success");
    setComposing(false);
    setForm({ title: "", body: "", kind: "question" });
    if (onOpen) onOpen(d.id);
    else load();
  }

  async function vote(id: string) {
    if (!signedIn) return toast("Sign in to vote.", "info");
    const r = await safeFetch(`/api/discussions/${id}/vote`, { method: "POST" });
    const d = await r.json();
    if (r.ok) setItems((xs) => xs?.map((x) => (x.id === id ? { ...x, upvoted: d.upvoted, score: d.score } : x)) || null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <select className="input !w-auto !py-1 text-xs" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="top">Most votes</option>
          <option value="new">Newest</option>
        </select>
        <select className="input !w-auto !py-1 text-xs" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">All posts</option>
          <option value="question">Questions</option>
          <option value="solution">Solutions</option>
          <option value="tip">Tips</option>
          <option value="general">General</option>
        </select>
        <button
          onClick={() => (signedIn ? setComposing((c) => !c) : toast("Sign in to post.", "info"))}
          className="btn btn-primary btn-sm ml-auto"
        >
          <Plus className="size-3.5" /> New post
        </button>
      </div>

      {composing && (
        <div className="animate-pop space-y-3 border-b border-border bg-surface-2/50 p-4">
          <div className="flex gap-2">
            <select className="input !w-auto" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="question">Question</option>
              <option value="solution">Solution / approach</option>
              <option value="tip">Tip</option>
              <option value="general">General</option>
            </select>
            <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <MarkdownEditor
            value={form.body}
            onChange={(body) => setForm({ ...form, body })}
            placeholder={form.kind === "solution" ? "Explain the intuition first, then the code. Please mark spoilers in the title!" : "What's on your mind?"}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setComposing(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button onClick={post} disabled={posting} className="btn btn-primary btn-sm">
              {posting && <Loader2 className="size-3.5 animate-spin" />} Post
            </button>
          </div>
        </div>
      )}

      {!items ? (
        <div className="p-8 text-center">
          <Loader2 className="mx-auto size-5 animate-spin text-muted" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No discussions yet" icon={<MessageSquare className="size-7" />}>
          Be the first — ask a question or share your approach.
        </EmptyState>
      ) : (
        <div className="divide-y divide-border">
          {items.map((d) => {
            const inner = (
              <>
                <div className="flex items-center gap-2">
                  {d.pinned && <Pin className="size-3.5 text-brand" />}
                  <KindBadge kind={d.kind} />
                  <span className="truncate font-semibold">{d.title}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{d.preview}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-faint">
                  <span className="inline-flex items-center gap-1.5">
                    <Avatar name={d.author?.name} image={d.author?.image} size={16} />
                    {d.author?.name}
                  </span>
                  <span>{timeAgo(d.createdAt)}</span>
                  {showProblem && d.problem && <span className="text-info">on {d.problem.title}</span>}
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="size-3" /> {d.commentCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3" /> {d.views}
                  </span>
                </div>
              </>
            );
            return (
              <div key={d.id} className="flex gap-3 px-4 py-3 hover:bg-surface-2/60">
                <button
                  onClick={() => vote(d.id)}
                  className={clsx("flex h-fit flex-col items-center rounded-lg px-1.5 py-1 text-xs font-bold", d.upvoted ? "text-brand" : "text-muted hover:text-text")}
                >
                  <ArrowBigUp className={clsx("size-5", d.upvoted && "fill-current")} />
                  {d.score}
                </button>
                {onOpen ? (
                  <button onClick={() => onOpen(d.id)} className="min-w-0 flex-1 text-left">
                    {inner}
                  </button>
                ) : (
                  <Link href={`/discuss/${d.id}`} className="min-w-0 flex-1">
                    {inner}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
