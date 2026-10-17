import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-mono text-6xl font-bold text-brand">404</p>
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="text-sm text-muted">The problem or page you were looking for doesn&apos;t exist (or isn&apos;t approved yet).</p>
      <Link href="/problems" className="btn btn-primary mt-2">
        Back to problems
      </Link>
    </div>
  );
}
