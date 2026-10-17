"use client";
import { safeFetch } from "@/lib/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, timeAgo } from "@/components/ui";
import { useToast } from "@/components/Toast";

type U = { id: string; name: string; username: string; email: string; image?: string; role: string; banned: boolean; createdAt: string; providers: string[]; submissions: number };

export default function UsersTable({ users, meId, q }: { users: U[]; meId: string; q: string }) {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = useState(q);
  async function patch(id: string, body: Record<string, unknown>) {
    const r = await safeFetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
    const d = await r.json();
    if (!r.ok) return toast(d.error, "error");
    toast("Updated", "success");
    router.refresh();
  }
  return (
    <div className="card overflow-hidden">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/admin/users?q=${encodeURIComponent(search)}`);
        }}
        className="border-b border-border p-3"
      >
        <input className="input" placeholder="Search by name, email or username…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Login</th>
              <th className="px-4 py-2">Subs</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-4 py-2">
                  <Link href={`/u/${u.username}`} className="flex items-center gap-2 font-medium hover:text-brand">
                    <Avatar name={u.name} image={u.image} size={24} /> {u.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted">{u.email}</td>
                <td className="px-4 py-2 text-muted">{u.providers.join(", ")}</td>
                <td className="px-4 py-2">{u.submissions}</td>
                <td className="px-4 py-2 text-muted">{timeAgo(u.createdAt)}</td>
                <td className="px-4 py-2">
                  <select className="input !w-auto !py-1 text-xs" value={u.role} disabled={u.id === meId} onChange={(e) => patch(u.id, { role: e.target.value })}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  {u.id !== meId && (
                    <button onClick={() => patch(u.id, { banned: !u.banned })} className={`btn btn-sm ${u.banned ? "btn-secondary" : "btn-ghost !text-danger"}`}>
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
