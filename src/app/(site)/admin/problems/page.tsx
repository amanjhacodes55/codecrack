import { dbConnect } from "@/lib/db";
import { Problem } from "@/lib/models/Problem";
import { plain } from "@/lib/serialize";
import AdminProblemsTable from "@/components/AdminProblemsTable";

export const metadata = { title: "All problems · Admin" };

export default async function AdminProblemsPage() {
  await dbConnect();
  const problems = await Problem.find().sort({ order: 1, createdAt: 1 }).select("slug title difficulty status origin collections stats").lean();
  return <AdminProblemsTable problems={plain(problems).map((p) => ({ ...p, id: String(p._id) })) as unknown as Parameters<typeof AdminProblemsTable>[0]["problems"]} />;
}
