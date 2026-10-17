"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/tracks", label: "Prep Tracks" },
  { href: "/mock", label: "Mock Test" },
  { href: "/discuss", label: "Discuss" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/contribute", label: "Contribute" },
];

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;
  const item = (l: { href: string; label: string }) => (
    <Link
      key={l.href}
      href={l.href}
      onClick={() => setOpen(false)}
      className={clsx(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        path.startsWith(l.href) ? "bg-surface-2 text-text" : "text-muted hover:text-text"
      )}
    >
      {l.label}
    </Link>
  );
  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">{links.map(item)}</nav>
      <button className="btn btn-ghost btn-sm !p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-border bg-surface p-3 md:hidden">
          {links.map(item)}
        </div>
      )}
    </>
  );
}
