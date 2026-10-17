import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import DiscussionThread from "@/components/discuss/DiscussionThread";

export const metadata = { title: "Discussion" };

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/discuss" className="btn btn-ghost btn-sm -ml-2 mb-3">
        <ArrowLeft className="size-3.5" /> Community
      </Link>
      <div className="card">
        <DiscussionThread id={id} me={me ? { id: me.id, role: me.role } : null} />
      </div>
    </div>
  );
}
