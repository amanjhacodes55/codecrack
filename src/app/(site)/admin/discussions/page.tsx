import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Comment, Discussion } from "@/lib/models/Discussion";
import "@/lib/models/User";
import "@/lib/models/Problem";
import { EmptyState, timeAgo } from "@/components/ui";

export const metadata = { title: "Discussions · Admin" };

export default async function AdminDiscussionsPage() {
  await dbConnect();
  const [posts, comments] = await Promise.all([
    Discussion.find({ deleted: false }).sort({ createdAt: -1 }).limit(50).populate("author", "name username").populate("problem", "title slug").lean(),
    Comment.find({ deleted: false }).sort({ createdAt: -1 }).limit(30).populate("author", "name username").lean(),
  ]);
  type A = { name: string; username: string } | null;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card overflow-hidden">
        <h2 className="border-b border-border px-5 py-3 font-semibold">Latest posts</h2>
        {posts.length === 0 && <EmptyState title="No posts yet" />}
        {posts.map((d) => (
          <Link key={String(d._id)} href={`/discuss/${d._id}`} className="block border-b border-border px-5 py-3 text-sm last:border-0 hover:bg-surface-2">
            <p className="font-medium">
              {d.pinned && "📌 "}
              {d.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              @{(d.author as unknown as A)?.username} · {timeAgo(d.createdAt)} · ▲ {d.score} · {d.commentCount} comments
              {d.problem ? ` · on ${(d.problem as unknown as { title: string }).title}` : ""}
            </p>
          </Link>
        ))}
      </div>
      <div className="card overflow-hidden">
        <h2 className="border-b border-border px-5 py-3 font-semibold">Latest comments</h2>
        {comments.length === 0 && <EmptyState title="No comments yet" />}
        {comments.map((c) => (
          <Link key={String(c._id)} href={`/discuss/${c.discussion}`} className="block border-b border-border px-5 py-3 text-sm last:border-0 hover:bg-surface-2">
            <p className="line-clamp-2">{c.body}</p>
            <p className="mt-0.5 text-xs text-muted">
              @{(c.author as unknown as A)?.username} · {timeAgo(c.createdAt)}
            </p>
          </Link>
        ))}
        <p className="px-5 py-3 text-xs text-faint">Open a thread to pin, delete posts or delete comments.</p>
      </div>
    </div>
  );
}
