import { getCurrentUser } from "@/lib/auth";
import DiscussionList from "@/components/discuss/DiscussionList";

export const metadata = { title: "Discuss" };

export default async function DiscussPage() {
  const me = await getCurrentUser();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Community</h1>
      <p className="mt-1 text-sm text-muted">
        Share interview experiences, exam patterns, approaches and doubts. Problem-specific threads also live in each problem&apos;s Discuss tab.
      </p>
      <div className="card mt-6 overflow-hidden">
        <DiscussionList signedIn={!!me} showProblem />
      </div>
    </div>
  );
}
