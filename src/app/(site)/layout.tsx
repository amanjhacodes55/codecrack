import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6 text-sm text-muted">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4">
          <span>CodeCrack — practice like it&apos;s the real exam.</span>
          <div className="flex gap-4">
            <Link href="/tracks" className="hover:text-text">Prep tracks</Link>
            <Link href="/contribute" className="hover:text-text">Contribute a problem</Link>
            <Link href="/discuss" className="hover:text-text">Community</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
