"use client";
import { safeFetch } from "@/lib/client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

export default function AuthForm({ mode, oauth }: { mode: "login" | "register"; oauth: { google: boolean; github: boolean } }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || (mode === "register" ? "/" : "/problems");
  const [form, setForm] = useState({ name: "", email: "", password: "", username: "" });
  const [err, setErr] = useState(params.get("error") ? "Sign-in failed. Try again." : "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      if (mode === "register") {
        const r = await safeFetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Sign-up failed");
      }
      const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (!res || res.error) throw new Error("Wrong email or password.");
      router.push(callbackUrl);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <div className="card p-7">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login" ? "Sign in to track progress and submit solutions." : "Free forever. Start cracking problems in a minute."}
        </p>

        {(oauth.google || oauth.github) && (
          <>
            <div className="mt-6 grid gap-2">
              {oauth.google && (
                <button onClick={() => signIn("google", { callbackUrl })} className="btn btn-secondary w-full">
                  <GoogleIcon /> Continue with Google
                </button>
              )}
              {oauth.github && (
                <button onClick={() => signIn("github", { callbackUrl })} className="btn btn-secondary w-full">
                  <GitHubIcon /> Continue with GitHub
                </button>
              )}
            </div>
            <div className="my-5 flex items-center gap-3 text-xs text-faint">
              <div className="h-px flex-1 bg-border" /> or with email <div className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className={oauth.google || oauth.github ? "grid gap-4" : "mt-6 grid gap-4"}>
          {mode === "register" && (
            <>
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.name} onChange={set("name")} required placeholder="Aman Jha" />
              </div>
              <div>
                <label className="label">Username (optional)</label>
                <input className="input" value={form.username} onChange={set("username")} placeholder="aman_codes" />
              </div>
            </>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={set("password")}
              required
              minLength={6}
              placeholder="At least 6 characters"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          {err && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{err}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-brand">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-semibold text-brand">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
