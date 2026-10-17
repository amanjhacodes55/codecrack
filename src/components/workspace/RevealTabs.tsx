"use client";
import { safeFetch } from "@/lib/client";
import { useState } from "react";
import { EyeOff, Loader2, Lock, PlayCircle, Search, ExternalLink } from "lucide-react";
import Markdown from "@/components/Markdown";
import { CopyButton } from "@/components/CodeBlock";
import { useToast } from "@/components/Toast";

type Kind = "editorial" | "solution" | "videos";
type Video = { title: string; url: string; kind: "video" | "search" };

const COPY: Record<Kind, { title: string; body: string; button: string }> = {
  editorial: {
    title: "Editorial is hidden",
    body: "Struggle a bit first — that is where learning happens. Try the hints in the Description tab, then come back if you're still stuck after ~25 minutes.",
    button: "Reveal editorial",
  },
  solution: {
    title: "Reference solution is hidden",
    body: "Revealing the full solution marks your future Accepted submission on this problem as “assisted” on your profile. Try the editorial first.",
    button: "Reveal solution",
  },
  videos: {
    title: "Video explanations are hidden",
    body: "Videos often give away the approach in the first minute. Reveal them when you want a guided walkthrough.",
    button: "Show videos",
  },
};

function youtubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function RevealTab({ kind, slug, available, signedIn }: { kind: Kind; slug: string; available: boolean; signedIn: boolean }) {
  const toast = useToast();
  const [state, setState] = useState<"locked" | "loading" | "open">("locked");
  const [data, setData] = useState<{ editorial?: string; solution?: Record<string, string>; videos?: Video[] }>({});

  if (!available)
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted">
        <EyeOff className="size-6 text-faint" />
        Nothing here yet for this problem.
      </div>
    );

  async function reveal() {
    if (!signedIn) {
      toast("Sign in to reveal editorials, solutions and videos.", "info");
      return;
    }
    setState("loading");
    const r = await safeFetch(`/api/problems/${slug}/reveal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    const d = await r.json();
    if (!r.ok) {
      toast(d.error || "Could not load", "error");
      setState("locked");
      return;
    }
    setData(d);
    setState("open");
  }

  if (state !== "open") {
    const c = COPY[kind];
    return (
      <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-2">
          <Lock className="size-5 text-muted" />
        </div>
        <h3 className="font-semibold">{c.title}</h3>
        <p className="max-w-sm text-sm text-muted">{c.body}</p>
        <button onClick={reveal} className="btn btn-secondary mt-2" disabled={state === "loading"}>
          {state === "loading" && <Loader2 className="size-4 animate-spin" />}
          {c.button}
        </button>
      </div>
    );
  }

  if (kind === "editorial") return <Markdown className="p-5">{data.editorial || "_No editorial yet._"}</Markdown>;

  if (kind === "solution") {
    const entries = Object.entries(data.solution || {});
    return (
      <div className="space-y-4 p-5">
        {entries.map(([lang, code]) => (
          <div key={lang}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">{lang}</span>
              <CopyButton text={code} />
            </div>
            <Markdown>{"```" + (lang === "cpp" ? "cpp" : lang) + "\n" + code + "\n```"}</Markdown>
          </div>
        ))}
      </div>
    );
  }

  const videos = data.videos || [];
  return (
    <div className="space-y-5 p-5">
      {videos.length === 0 && <p className="text-sm text-muted">No videos linked yet.</p>}
      {videos.map((v, i) => {
        const id = v.kind === "video" ? youtubeId(v.url) : null;
        return id ? <VideoCard key={i} id={id} title={v.title} url={v.url} /> : (
          <a key={i} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm hover:border-brand">
            <Search className="size-4 shrink-0 text-muted" />
            <span className="flex-1">{v.title}</span>
            <ExternalLink className="size-3.5 text-faint" />
          </a>
        );
      })}
    </div>
  );
}

/** Thumbnail first; the YouTube player only loads when clicked (fast even with many videos). */
function VideoCard({ id, title, url }: { id: string; title: string; url: string }) {
  const [playing, setPlaying] = useState(false);
  const [name, channel] = title.includes(" — ") ? [title.slice(0, title.lastIndexOf(" — ")), title.slice(title.lastIndexOf(" — ") + 3)] : [title, ""];
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {playing ? (
        <div className="aspect-video bg-black">
          <iframe
            className="size-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
            title={name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button onClick={() => setPlaying(true)} className="group relative block aspect-video w-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-red-600 shadow-lg transition-transform group-hover:scale-110">
              <PlayCircle className="size-8 text-white" />
            </span>
          </span>
        </button>
      )}
      <div className="flex items-start gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{name}</p>
          {channel && <p className="mt-0.5 text-xs text-muted">{channel}</p>}
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="shrink-0 text-faint hover:text-text" title="Open on YouTube">
          <ExternalLink className="size-4" />
        </a>
      </div>
    </div>
  );
}
