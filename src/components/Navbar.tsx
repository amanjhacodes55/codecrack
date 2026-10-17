import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui";
import NavLinks from "@/components/NavLinks";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";

export default async function Navbar({ compact = false }: { compact?: boolean }) {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className={compact ? "flex h-12 items-center gap-4 px-3" : "mx-auto flex h-14 max-w-7xl items-center gap-6 px-4"}>
        <Logo />
        <NavLinks isAdmin={user?.role === "admin"} />
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationBell />
              <UserMenu user={user} />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
