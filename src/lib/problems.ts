import "server-only";
import { Types } from "mongoose";
import { Problem } from "@/lib/models/Problem";
import { Submission } from "@/lib/models/Submission";
import type { SessionUser } from "@/lib/auth";

/** Problem ids the user has solved / attempted. */
export async function userProgress(userId?: string | null) {
  const solved = new Set<string>();
  const attempted = new Set<string>();
  if (!userId) return { solved, attempted };
  const rows = await Submission.aggregate<{ _id: Types.ObjectId; ac: number }>([
    { $match: { user: new Types.ObjectId(userId) } },
    { $group: { _id: "$problem", ac: { $max: { $cond: [{ $eq: ["$verdict", "Accepted"] }, 1, 0] } } } },
  ]);
  for (const r of rows) (r.ac ? solved : attempted).add(String(r._id));
  return { solved, attempted };
}

/** Load a problem the user is allowed to see (approved, or own / admin for unapproved). */
export async function findVisibleProblem(slug: string, user: SessionUser | null, extra = "") {
  const p = await Problem.findOne({ slug }).select(extra);
  if (!p) return null;
  if (p.status === "approved") return p;
  if (user && (user.role === "admin" || String(p.author) === user.id)) return p;
  return null;
}

export function verdictFromCode(code: string) {
  return (
    {
      AC: "Accepted",
      WA: "Wrong Answer",
      TLE: "Time Limit Exceeded",
      MLE: "Memory Limit Exceeded",
      RE: "Runtime Error",
      OLE: "Output Limit Exceeded",
      CE: "Compilation Error",
    } as Record<string, string>
  )[code] || code;
}

export function clip(s: string | undefined | null, n = 4000) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + `\n… (${s.length - n} more characters)` : s;
}
