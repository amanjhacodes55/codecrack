"use client";
import { safeFetch } from "@/lib/client";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function NotesTab({ slug, initial, signedIn }: { slug: string; initial: string; signedIn: boolean }) {
  const [body, setBody] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!signedIn) return;
    setStatus("saving");
    const t = setTimeout(async () => {
      await safeFetch("/api/notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, body }) });
      setStatus("saved");
    }, 800);
    return () => clearTimeout(t);
  }, [body, slug, signedIn]);

  return (
    <div className="flex h-full flex-col gap-2 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">My notes</h3>
          <p className="text-xs text-muted">Private. Write the key idea in one line — revise these before the exam.</p>
        </div>
        <span className="text-xs text-muted">
          {status === "saving" && <Loader2 className="inline size-3.5 animate-spin" />}
          {status === "saved" && (
            <span className="inline-flex items-center gap-1 text-brand">
              <Check className="size-3.5" /> Saved
            </span>
          )}
        </span>
      </div>
      <textarea
        className="input min-h-[300px] flex-1 resize-none font-mono text-[13px] leading-relaxed"
        placeholder={signedIn ? "e.g. Prefix sum + hashmap of first index where (count1 - count0) was seen…" : "Sign in to keep notes."}
        value={body}
        disabled={!signedIn}
        onChange={(e) => setBody(e.target.value)}
      />
    </div>
  );
}
