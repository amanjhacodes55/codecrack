import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Problem } from "@/lib/models/Problem";
import { userProgress } from "@/lib/problems";
import MockTest from "@/components/MockTest";

export const metadata = { title: "Mock test" };
export const dynamic = "force-dynamic";

export default async function MockPage() {
  await dbConnect();
  const me = await getCurrentUser();
  const [problems, progress] = await Promise.all([
    Problem.find({ status: "approved", collections: { $in: ["infosys-sp-dse", "infosys-easy-medium", "hackwithinfy"] } })
      .select("slug title difficulty collections")
      .lean(),
    userProgress(me?.id),
  ]);
  const pool = problems.map((p) => ({ slug: p.slug, title: p.title, difficulty: p.difficulty, solved: progress.solved.has(String(p._id)) }));
  return <MockTest pool={pool} signedIn={!!me} />;
}
