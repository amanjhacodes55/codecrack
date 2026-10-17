import { ShieldCheck } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { Problem } from "@/lib/models/Problem";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  await dbConnect();
  const pending = await Problem.countDocuments({ status: "pending" });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <ShieldCheck className="size-6 text-brand" /> Admin
      </h1>
      <AdminNav pending={pending} />
      {children}
    </div>
  );
}
