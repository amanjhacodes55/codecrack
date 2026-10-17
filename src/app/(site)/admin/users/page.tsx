import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/lib/models/User";
import { Submission } from "@/lib/models/Submission";
import { plain } from "@/lib/serialize";
import UsersTable from "@/components/UsersTable";

export const metadata = { title: "Users · Admin" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  await dbConnect();
  const me = await getCurrentUser();
  const filter = q ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }, { username: { $regex: q, $options: "i" } }] } : {};
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200).select("name username email image role banned createdAt providers").lean();
  const counts = await Submission.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$user", n: { $sum: 1 } } }]);
  const byUser = new Map(counts.map((c) => [String(c._id), c.n]));
  return (
    <UsersTable
      meId={me!.id}
      q={q || ""}
      users={plain(users).map((u) => ({ ...u, id: String(u._id), submissions: byUser.get(String(u._id)) || 0 })) as unknown as Parameters<typeof UsersTable>[0]["users"]}
    />
  );
}
