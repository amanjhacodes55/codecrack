"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function AdminNav({ pending }: { pending: number }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Review queue", badge: pending },
    { href: "/admin/problems", label: "All problems" },
    { href: "/admin/discussions", label: "Discussions" },
    { href: "/admin/users", label: "Users" },
  ];
  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={clsx("relative flex items-center gap-2 px-3 py-2.5 text-sm font-medium", (i.href === "/admin" ? path === "/admin" || path.startsWith("/admin/problems/") : path === i.href) ? "text-text" : "text-muted hover:text-text")}
        >
          {i.label}
          {!!i.badge && <span className="rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">{i.badge}</span>}
          {(i.href === "/admin" ? path === "/admin" || path.startsWith("/admin/problems/") : path === i.href) && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />}
        </Link>
      ))}
    </div>
  );
}
