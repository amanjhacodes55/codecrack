"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProblemFilters({ tags, companies, signedIn }: { tags: string[]; companies: string[]; signedIn: boolean }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");

  const update = (key: string, value: string) => {
    const u = new URLSearchParams(sp.toString());
    if (value) u.set(key, value);
    else u.delete(key);
    router.replace(`${path}?${u}`, { scroll: false });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get("q") || "") !== q) update("q", q);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = ["difficulty", "tag", "company", "status", "sort", "q", "collection", "origin"].some((k) => sp.get(k));
  const Select = ({ k, label, options }: { k: string; label: string; options: [string, string][] }) => (
    <select className="input !w-auto !py-1.5 pr-8" value={sp.get(k) || ""} onChange={(e) => update(k, e.target.value)}>
      <option value="">{label}</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[160px] flex-1 basis-full sm:basis-auto">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <input className="input !py-1.5 !pl-9" placeholder="Search problems or topics…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Select k="difficulty" label="Difficulty" options={[["Easy", "Easy"], ["Medium", "Medium"], ["Hard", "Hard"]]} />
      {signedIn && (
        <Select
          k="status"
          label="Status"
          options={[["todo", "Todo"], ["attempted", "Attempted"], ["solved", "Solved"], ["bookmarked", "Bookmarked"]]}
        />
      )}
      <Select k="tag" label="Topic" options={tags.map((t) => [t, t])} />
      <Select k="company" label="Company" options={companies.map((c) => [c, c])} />
      <Select
        k="sort"
        label="Sort"
        options={[["difficulty", "Difficulty"], ["acceptance", "Acceptance"], ["popular", "Most solved"]]}
      />
      {active && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setQ("");
            router.replace(path);
          }}
        >
          <X className="size-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
