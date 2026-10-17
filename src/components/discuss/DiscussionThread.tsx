"use client";
import { safeFetch } from "@/lib/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowBigUp, ArrowLeft, Loader2, MessageSquare, Pin, Reply, Trash2, ShieldCheck } from "lucide-react";
import { Avatar, timeAgo } from "@/components/ui";
import Markdown from "@/components/Markdown";
import { useToast } from "@/components/Toast";
import MarkdownEditor from "./MarkdownEditor";
import { KindBadge } from "./DiscussionList";

type Author = { _id: string; name: string; username: string; image?: string; role?: string } | null;
type CommentT = { id: string; parent: string | null; body: string; deleted: boolean; score: number; upvoted: boolean; createdAt: string; author: Author };
type Thread = {
  id: string;
  title: string;
  body: string;
  kind: string;
  score: number;
  upvoted: boolean;
  views: number;
  pinned: boolean;
  createdAt: string;
  author: Author;
  problem?: { slug: string; title: string } | null;
};

export default function DiscussionThread({
  id,
  me,
  onBack,
}: {
  id: string;
  me: { id: string; role: string } | null;
  onBack?: () => void;
}) {
  const toast = useToast();
  const [data, setData] = useState<{ discussion: Thread; comments: CommentT[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    safeFetch(`/api/discussions/${id}`).then(async (r) => {
      if (!r.ok) return setNotFound(true);
      setData(await r.json());
    });
  }, [id]);
  useEffect(load, [load]);

  const tree = useMemo(() => {
    const kids = new Map<string | null, CommentT[]>();
    for (const c of data?.comments || []) {
      const k = c.parent;
      kids.set(k, [...(kids.get(k) || []), c]);
    }
    return kids;
  }, [data]);

  if (notFound) return <p className="p-6 text-sm text-muted">This discussion was removed or does not exist.</p>;
  if (!data)
    return (
      <div className="p-8 text-center">
        <Loader2 className="mx-auto size-5 animate-spin text-muted" />
      </div>
    );
  const d = data.discussion;
  const canModerate = (authorId?: string) => !!me && (me.role === "admin" || me.id === authorId);

  async function postComment(body: string, parent: string | null) {
    if (!me) {
      toast("Sign in to comment.", "info");
      return false;
    }
    const r = await safeFetch(`/api/discussions/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, parent }),
    });
    const j = await r.json();
    if (!r.ok) {
      toast(j.error, "error");
      return false;
    }
    load();
    return true;
  }
  async function vote(url: string, apply: (upvoted: boolean, score: number) => void) {
    if (!me) return toast("Sign in to vote.", "info");
    const r = await safeFetch(url, { method: "POST" });
    const j = await r.json();
    if (r.ok) apply(j.upvoted, j.score);
  }
  async function removeThread() {
    if (!confirm("Delete this post?")) return;
    const r = await safeFetch(`/api/discussions/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast("Post deleted", "success");
      if (onBack) onBack();
      else window.location.href = "/discuss";
    }
  }
  async function togglePin() {
    await safeFetch(`/api/discussions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pinned: !d.pinned }) });
    load();
  }

  return (
    <div className="p-5">
      {onBack && (
        <button onClick={onBack} className="btn btn-ghost btn-sm mb-3 -ml-2">
          <ArrowLeft className="size-3.5" /> All discussions
        </button>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => vote(`/api/discussions/${id}/vote`, (upvoted, score) => setData({ ...data, discussion: { ...d, upvoted, score } }))}
          className={clsx("flex h-fit flex-col items-center rounded-lg px-1.5 py-1 text-sm font-bold", d.upvoted ? "text-brand" : "text-muted hover:text-text")}
        >
          <ArrowBigUp className={clsx("size-6", d.upvoted && "fill-current")} />
          {d.score}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {d.pinned && <Pin className="size-4 text-brand" />}
            <KindBadge kind={d.kind} />
            <h2 className="text-lg font-bold">{d.title}</h2>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            {d.author && (
              <Link href={`/u/${d.author.username}`} className="inline-flex items-center gap-1.5 font-medium text-text hover:text-brand">
                <Avatar name={d.author.name} image={d.author.image} size={18} /> {d.author.name}
              </Link>
            )}
            <span>· {timeAgo(d.createdAt)}</span>
            <span>· {d.views} views</span>
            {d.problem && !onBack && (
              <Link href={`/problems/${d.problem.slug}`} className="text-info hover:underline">
                · {d.problem.title}
              </Link>
            )}
            <span className="ml-auto flex gap-1">
              {me?.role === "admin" && (
                <button onClick={togglePin} className="btn btn-ghost btn-sm !px-2 !py-1">
                  <Pin className="size-3.5" /> {d.pinned ? "Unpin" : "Pin"}
                </button>
              )}
              {canModerate(d.author?._id) && (
                <button onClick={removeThread} className="btn btn-ghost btn-sm !px-2 !py-1 !text-danger">
                  <Trash2 className="size-3.5" /> Delete
                </button>
              )}
            </span>
          </div>
          <Markdown className="mt-4">{d.body}</Markdown>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="size-4" /> {data.comments.filter((c) => !c.deleted).length} comments
        </h3>
        <MarkdownEditor value={reply} onChange={setReply} placeholder={me ? "Add a comment…" : "Sign in to comment"} minHeight={80} />
        <div className="mt-2 flex justify-end">
          <button
            disabled={busy || !reply.trim()}
            onClick={async () => {
              setBusy(true);
              if (await postComment(reply, null)) setReply("");
              setBusy(false);
            }}
            className="btn btn-primary btn-sm"
          >
            Comment
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {(tree.get(null) || []).map((c) => (
            <CommentNode
              key={c.id}
              c={c}
              tree={tree}
              depth={0}
              me={me}
              onReply={postComment}
              onVote={(cid) =>
                vote(`/api/comments/${cid}/vote`, (upvoted, score) =>
                  setData({ ...data, comments: data.comments.map((x) => (x.id === cid ? { ...x, upvoted, score } : x)) })
                )
              }
              onDelete={async (cid) => {
                if (!confirm("Delete this comment?")) return;
                await safeFetch(`/api/comments/${cid}`, { method: "DELETE" });
                load();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentNode({
  c,
  tree,
  depth,
  me,
  onReply,
  onVote,
  onDelete,
}: {
  c: CommentT;
  tree: Map<string | null, CommentT[]>;
  depth: number;
  me: { id: string; role: string } | null;
  onReply: (body: string, parent: string | null) => Promise<boolean>;
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const children = tree.get(c.id) || [];
  return (
    <div className={clsx(depth > 0 && "border-l-2 border-border pl-4")}>
      <div className="flex items-center gap-2 text-xs">
        {c.author ? (
          <Link href={`/u/${c.author.username}`} className="inline-flex items-center gap-1.5 font-semibold hover:text-brand">
            <Avatar name={c.author.name} image={c.author.image} size={20} /> {c.author.name}
            {c.author.role === "admin" && <ShieldCheck className="size-3.5 text-brand" />}
          </Link>
        ) : (
          <span className="text-faint">[deleted]</span>
        )}
        <span className="text-faint">{timeAgo(c.createdAt)}</span>
      </div>
      {c.deleted ? <p className="mt-1 text-sm italic text-faint">This comment was deleted.</p> : <Markdown className="mt-1 !text-sm">{c.body}</Markdown>}
      {!c.deleted && (
        <div className="mt-1 flex items-center gap-1 text-xs">
          <button onClick={() => onVote(c.id)} className={clsx("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold", c.upvoted ? "text-brand" : "text-muted hover:text-text")}>
            <ArrowBigUp className={clsx("size-4", c.upvoted && "fill-current")} /> {c.score}
          </button>
          {depth < 4 && (
            <button onClick={() => setReplying((r) => !r)} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-muted hover:text-text">
              <Reply className="size-3.5" /> Reply
            </button>
          )}
          {me && (me.role === "admin" || me.id === c.author?._id) && (
            <button onClick={() => onDelete(c.id)} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-muted hover:text-danger">
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      )}
      {replying && (
        <div className="mt-2 space-y-2">
          <MarkdownEditor value={text} onChange={setText} minHeight={60} placeholder="Write a reply…" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setReplying(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button
              disabled={!text.trim()}
              onClick={async () => {
                if (await onReply(text, c.id)) {
                  setText("");
                  setReplying(false);
                }
              }}
              className="btn btn-primary btn-sm"
            >
              Reply
            </button>
          </div>
        </div>
      )}
      {children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((k) => (
            <CommentNode key={k.id} c={k} tree={tree} depth={depth + 1} me={me} onReply={onReply} onVote={onVote} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
