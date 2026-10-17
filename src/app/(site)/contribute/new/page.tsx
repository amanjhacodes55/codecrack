import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProblemForm, { EMPTY } from "@/components/ProblemForm";

export const metadata = { title: "New problem" };

export default async function NewProblemPage() {
  if (!(await getCurrentUser())) redirect("/login?callbackUrl=/contribute/new");
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">New problem</h1>
      <ProblemForm initial={EMPTY} />
    </div>
  );
}
