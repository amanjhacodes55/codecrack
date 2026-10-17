"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import clsx from "clsx";
import { safeFetch } from "@/lib/client";
import { timeAgo } from "@/components/ui";

type N = { id: string; text: string; link: string; read: boolean; createdAt: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ unread: number; items: N[] }>({ unread: 0, items: [] });
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await safeFetch("/api/notifications");
    if (r.ok) setData(await r.json());
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => {
      clearInterval(t);
      document.removeEventListener("mousedown", close);
    };
  }, [load]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && data.unread) {
      await safeFetch("/api/notifications", { method: "POST" });
      setData((d) => ({ ...d, unread: 0 }));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="btn btn-ghost btn-sm relative !p-2" aria-label="Notifications">
        <Bell className="size-4" />
        {data.unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {data.unread > 9 ? "9+" : data.unread}
          </span>
        )}
      </button>
      {open && (
        <div className="card animate-pop absolute right-0 top-10 z-50 w-80 overflow-hidden shadow-pop">
          <div className="border-b border-border px-4 py-2.5 text-sm font-semibold">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {data.items.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">You&apos;re all caught up.</p>}
            {data.items.map((n) => (
              <Link
                key={n.id}
                href={n.link || "#"}
                onClick={() => setOpen(false)}
                className={clsx("block border-b border-border px-4 py-3 text-sm last:border-0 hover:bg-surface-2", !n.read && "bg-brand-soft/30")}
              >
                <p>{n.text}</p>
                <p className="mt-0.5 text-xs text-faint">{timeAgo(n.createdAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
