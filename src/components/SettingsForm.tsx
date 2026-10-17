"use client";
import { safeFetch } from "@/lib/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Avatar } from "@/components/ui";

type U = {
  name: string;
  username: string;
  email: string;
  image?: string;
  bio?: string;
  college?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  targetExam?: string;
  targetDate?: string;
  preferredLanguage?: string;
  providers?: string[];
};

export default function SettingsForm({ user }: { user: U }) {
  const toast = useToast();
  const router = useRouter();
  const [f, setF] = useState({
    name: user.name,
    username: user.username,
    image: user.image || "",
    bio: user.bio || "",
    college: user.college || "",
    location: user.location || "",
    github: user.github || "",
    linkedin: user.linkedin || "",
    website: user.website || "",
    targetExam: user.targetExam || "",
    targetDate: user.targetDate ? user.targetDate.slice(0, 10) : "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await safeFetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, targetDate: f.targetDate || null }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast(d.error, "error");
    toast("Profile saved", "success");
    router.push(`/u/${f.username}`);
    router.refresh();
  }

  const Field = ({ k, label, placeholder, type = "text" }: { k: keyof typeof f; label: string; placeholder?: string; type?: string }) => (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} value={f[k]} onChange={set(k)} placeholder={placeholder} />
    </div>
  );

  return (
    <form onSubmit={save} className="mt-6 space-y-6">
      <div className="card space-y-4 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={f.name} image={f.image} size={64} />
          <div className="flex-1">
            {Field({ k: "image", label: "Avatar URL", placeholder: "https://… (Google/GitHub avatar is used automatically)" })}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Field({ k: "name", label: "Name" })}
          {Field({ k: "username", label: "Username" })}
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-[80px]" value={f.bio} onChange={set("bio")} maxLength={300} placeholder="Final year CSE · Python · cracking Infosys SP" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Field({ k: "college", label: "College" })}
          {Field({ k: "location", label: "Location" })}
          {Field({ k: "github", label: "GitHub", placeholder: "github.com/you" })}
          {Field({ k: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you" })}
          {Field({ k: "website", label: "Website / portfolio" })}
        </div>
      </div>
      <div className="card space-y-4 p-6">
        <h2 className="font-semibold">Exam goal</h2>
        <p className="-mt-2 text-sm text-muted">Shows a countdown on your dashboard and profile.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {Field({ k: "targetExam", label: "Target exam", placeholder: "Infosys SP / DSE" })}
          {Field({ k: "targetDate", label: "Exam date", type: "date" })}
        </div>
      </div>
      <div className="card p-6 text-sm text-muted">
        Signed in as <b className="text-text">{user.email}</b> via {(user.providers || []).join(", ") || "email"}.
      </div>
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />} Save changes
        </button>
      </div>
    </form>
  );
}
