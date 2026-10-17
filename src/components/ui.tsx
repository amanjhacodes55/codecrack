import clsx from "clsx";
import Link from "next/link";

export function DifficultyBadge({ difficulty, className }: { difficulty: string; className?: string }) {
  const color =
    difficulty === "Easy"
      ? "text-easy bg-easy/10 border-easy/25"
      : difficulty === "Medium"
        ? "text-medium bg-medium/10 border-medium/25"
        : "text-hard bg-hard/10 border-hard/25";
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", color, className)}>
      {difficulty}
    </span>
  );
}

export function DifficultyText({ difficulty }: { difficulty: string }) {
  const color = difficulty === "Easy" ? "text-easy" : difficulty === "Medium" ? "text-medium" : "text-hard";
  return <span className={clsx("text-sm font-semibold", color)}>{difficulty}</span>;
}

export function Avatar({ name, image, size = 32 }: { name?: string | null; image?: string | null; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = [...(name || "x")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (image)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name || ""} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} referrerPolicy="no-referrer" />;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 55% 45%)` }}
    >
      {initials}
    </span>
  );
}

export function VerdictText({ verdict, className }: { verdict: string; className?: string }) {
  const ok = verdict === "Accepted";
  const ce = verdict === "Compilation Error";
  return (
    <span className={clsx("font-semibold", ok ? "text-brand" : ce ? "text-warn" : "text-danger", className)}>{verdict}</span>
  );
}

export function UserLink({ user }: { user?: { name?: string; username?: string; image?: string } | null }) {
  if (!user) return <span className="text-faint">[deleted]</span>;
  return (
    <Link href={`/u/${user.username}`} className="inline-flex items-center gap-2 font-medium hover:text-brand">
      <Avatar name={user.name} image={user.image} size={22} />
      {user.name}
    </Link>
  );
}

export function EmptyState({ title, children, icon }: { title: string; children?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      {icon && <div className="mb-1 text-faint">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {children && <div className="max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={clsx("flex items-center gap-2 font-extrabold tracking-tight", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.svg" alt="" width={28} height={28} className="size-7" />
      <span className="text-[17px]">
        Code<span className="text-brand">Crack</span>
      </span>
    </Link>
  );
}
