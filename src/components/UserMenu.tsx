"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, User, ShieldCheck, FilePlus2, ListChecks, Bookmark } from "lucide-react";
import { Avatar } from "@/components/ui";
import type { SessionUser } from "@/lib/auth";

export default function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const Item = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <Link href={href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-surface-2">
      {icon}
      {children}
    </Link>
  );
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center rounded-full ring-brand/40 hover:ring-2" aria-label="Account menu">
        <Avatar name={user.name} image={user.image} size={30} />
      </button>
      {open && (
        <div className="card animate-pop absolute right-0 top-10 z-50 w-60 p-1.5 shadow-pop">
          <div className="border-b border-border px-2.5 pb-2.5 pt-1.5">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted">@{user.username}</p>
          </div>
          <div className="py-1">
            <Item href={`/u/${user.username}`} icon={<User className="size-4 text-muted" />}>
              My profile
            </Item>
            <Item href="/submissions" icon={<ListChecks className="size-4 text-muted" />}>
              My submissions
            </Item>
            <Item href="/problems?status=bookmarked" icon={<Bookmark className="size-4 text-muted" />}>
              Bookmarks
            </Item>
            <Item href="/contribute" icon={<FilePlus2 className="size-4 text-muted" />}>
              My contributed problems
            </Item>
            <Item href="/settings" icon={<Settings className="size-4 text-muted" />}>
              Settings
            </Item>
            {user.role === "admin" && (
              <Item href="/admin" icon={<ShieldCheck className="size-4 text-brand" />}>
                Admin panel
              </Item>
            )}
          </div>
          <button
            onClick={async () => {
              // stay on the current origin (works behind tunnels / custom domains)
              await signOut({ redirect: false });
              window.location.href = "/";
            }}
            className="flex w-full items-center gap-2.5 rounded-md border-t border-border px-2.5 py-2 text-sm text-danger hover:bg-surface-2"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
