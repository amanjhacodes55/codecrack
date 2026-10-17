import "server-only";
import { Types } from "mongoose";
import { Submission } from "@/lib/models/Submission";
import { Problem } from "@/lib/models/Problem";

export const POINTS: Record<string, number> = { Easy: 10, Medium: 25, Hard: 50 };

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export async function userStats(userId: string) {
  const uid = new Types.ObjectId(userId);
  const [subs, problems] = await Promise.all([
    Submission.find({ user: uid }).select("problem verdict createdAt language assisted slug timeMs").sort({ createdAt: 1 }).lean(),
    Problem.find({ status: "approved" }).select("slug title difficulty tags collections").lean(),
  ]);
  const byId = new Map(problems.map((p) => [String(p._id), p]));

  const firstAc = new Map<string, { at: Date; assisted: boolean }>();
  const attempted = new Set<string>();
  const heat = new Map<string, number>();
  const langs = new Map<string, number>();
  for (const s of subs) {
    const id = String(s.problem);
    attempted.add(id);
    const k = dayKey(new Date(s.createdAt));
    heat.set(k, (heat.get(k) || 0) + 1);
    langs.set(s.language, (langs.get(s.language) || 0) + 1);
    if (s.verdict === "Accepted" && !firstAc.has(id)) firstAc.set(id, { at: new Date(s.createdAt), assisted: !!s.assisted });
  }
  const solvedIds = [...firstAc.keys()].filter((id) => byId.has(id));
  const solvedProblems = solvedIds.map((id) => byId.get(id)!);
  const difficulty = (["Easy", "Medium", "Hard"] as const).map((d) => ({
    difficulty: d,
    solved: solvedProblems.filter((p) => p.difficulty === d).length,
    total: problems.filter((p) => p.difficulty === d).length,
  }));
  const accepted = subs.filter((s) => s.verdict === "Accepted").length;

  // streaks (days with at least one submission)
  const days = [...heat.keys()].sort();
  let maxStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const d = new Date(k);
    run = prev && (d.getTime() - prev.getTime()) / 86400000 === 1 ? run + 1 : 1;
    maxStreak = Math.max(maxStreak, run);
    prev = d;
  }
  let streak = 0;
  const cursor = new Date();
  if (!heat.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (heat.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const tagMap = new Map<string, { solved: number; total: number }>();
  for (const p of problems)
    for (const t of p.tags) {
      const e = tagMap.get(t) || { solved: 0, total: 0 };
      e.total++;
      if (firstAc.has(String(p._id))) e.solved++;
      tagMap.set(t, e);
    }

  const score = solvedProblems.reduce((a, p) => a + (firstAc.get(String(p._id))?.assisted ? POINTS[p.difficulty] / 2 : POINTS[p.difficulty]), 0);
  const infosys = problems.filter((p) => p.collections.includes("infosys-sp-dse"));
  const infosysSolved = infosys.filter((p) => firstAc.has(String(p._id))).length;

  const badges: { id: string; label: string; desc: string; earned: boolean }[] = [
    { id: "first", label: "First Blood", desc: "Solve your first problem", earned: solvedIds.length >= 1 },
    { id: "ten", label: "Getting Serious", desc: "Solve 10 problems", earned: solvedIds.length >= 10 },
    { id: "thirty", label: "Grinder", desc: "Solve 30 problems", earned: solvedIds.length >= 30 },
    { id: "hard5", label: "Hard Hitter", desc: "Solve 5 Hard problems", earned: difficulty[2].solved >= 5 },
    { id: "streak7", label: "On Fire", desc: "7-day practice streak", earned: maxStreak >= 7 },
    { id: "infosys", label: "Infosys Ready", desc: "Solve 75% of the Infosys SP/DSE set", earned: infosys.length > 0 && infosysSolved / infosys.length >= 0.75 },
    { id: "clean", label: "No Peeking", desc: "10 solves without revealing solutions", earned: [...firstAc.values()].filter((v) => !v.assisted).length >= 10 },
  ];

  return {
    solved: solvedIds.length,
    totalProblems: problems.length,
    attempted: attempted.size,
    submissions: subs.length,
    acceptance: subs.length ? Math.round((accepted / subs.length) * 100) : 0,
    difficulty,
    heatmap: Object.fromEntries(heat),
    streak,
    maxStreak,
    languages: Object.fromEntries(langs),
    tags: [...tagMap.entries()].map(([tag, v]) => ({ tag, ...v })).sort((a, b) => b.solved - a.solved || b.total - a.total),
    score,
    infosys: { solved: infosysSolved, total: infosys.length },
    badges,
    recent: [...firstAc.entries()]
      .sort((a, b) => b[1].at.getTime() - a[1].at.getTime())
      .slice(0, 10)
      .filter(([id]) => byId.has(id))
      .map(([id, v]) => ({ slug: byId.get(id)!.slug, title: byId.get(id)!.title, difficulty: byId.get(id)!.difficulty, at: v.at.toISOString(), assisted: v.assisted })),
  };
}

export async function leaderboard(sinceDays?: number) {
  const match: Record<string, unknown> = { verdict: "Accepted" };
  if (sinceDays) match.createdAt = { $gte: new Date(Date.now() - sinceDays * 86400000) };
  const rows = await Submission.aggregate<{
    _id: Types.ObjectId;
    problems: { problem: Types.ObjectId; assisted: boolean }[];
    last: Date;
  }>([
    { $match: match },
    { $sort: { createdAt: 1 } },
    { $group: { _id: { user: "$user", problem: "$problem" }, assisted: { $first: "$assisted" }, at: { $first: "$createdAt" } } },
    { $group: { _id: "$_id.user", problems: { $push: { problem: "$_id.problem", assisted: "$assisted" } }, last: { $max: "$at" } } },
  ]);
  const problems = await Problem.find({ status: "approved" }).select("difficulty").lean();
  const diff = new Map(problems.map((p) => [String(p._id), p.difficulty]));
  return rows
    .map((r) => {
      let score = 0;
      const counts = { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>;
      for (const p of r.problems) {
        const d = diff.get(String(p.problem));
        if (!d) continue;
        counts[d]++;
        score += p.assisted ? POINTS[d] / 2 : POINTS[d];
      }
      return { user: String(r._id), score, counts, solved: counts.Easy + counts.Medium + counts.Hard, last: r.last };
    })
    .filter((r) => r.solved > 0)
    .sort((a, b) => b.score - a.score || a.last.getTime() - b.last.getTime());
}
