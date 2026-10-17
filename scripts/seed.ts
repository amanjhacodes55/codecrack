/**
 * Loads official problems from content/problems and study tracks from content/tracks into MongoDB.
 * Safe to run repeatedly: it upserts by slug and keeps submission stats.
 *   npm run seed
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import path from "node:path";
import mongoose from "mongoose";
import { dbConnect } from "../src/lib/db";
import { Problem } from "../src/lib/models/Problem";
import { Track } from "../src/lib/models/Track";
import { User } from "../src/lib/models/User";
import { Submission } from "../src/lib/models/Submission";
import { Comment, Discussion, Draft, Note } from "../src/lib/models/Discussion";
import { Notification } from "../src/lib/models/Notification";

const ROOT = path.join(process.cwd(), "content");

/** Hash of everything the seed loads — lets `--if-changed` skip work on restarts (fast cold starts on free hosts). */
function contentHash() {
  const h = createHash("sha1");
  const walk = (dir: string) => {
    for (const f of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(json|py)$/.test(f.name)) h.update(p).update(readFileSync(p));
    }
  };
  walk(path.join(ROOT, "problems"));
  walk(path.join(ROOT, "tracks"));
  return h.digest("hex");
}

async function main() {
  await dbConnect();
  // Make sure all indexes exist (incl. TTL auto-cleanup for notifications and stale drafts).
  for (const m of [User, Problem, Submission, Discussion, Comment, Note, Draft, Notification, Track]) await m.createIndexes();
  const meta = mongoose.connection.collection("meta");
  const hash = contentHash();
  if (process.argv.includes("--if-changed")) {
    const prev = await meta.findOne({ _id: "content" as unknown as never });
    if (prev && (prev as unknown as { hash: string }).hash === hash) {
      console.log("content unchanged — skipping seed");
      await mongoose.disconnect();
      return;
    }
  }
  const dirs = readdirSync(path.join(ROOT, "problems")).sort();
  let loaded = 0;
  const skipped: string[] = [];
  for (const d of dirs) {
    const dir = path.join(ROOT, "problems", d);
    const metaPath = path.join(dir, "problem.json");
    const testsPath = path.join(dir, "tests.json");
    if (!existsSync(metaPath)) continue;
    if (!existsSync(testsPath)) {
      skipped.push(`${d} (no tests.json — run build_tests.py)`);
      continue;
    }
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    const testsGz = gzipSync(readFileSync(testsPath), { level: 9 });
    const solution = existsSync(path.join(dir, "solution.py")) ? readFileSync(path.join(dir, "solution.py"), "utf8") : "";
    await Problem.updateOne(
      { slug: meta.slug },
      {
        $set: {
          title: meta.title,
          difficulty: meta.difficulty,
          tags: meta.tags || [],
          companies: meta.companies || [],
          collections: meta.collections || [],
          source: meta.source || "",
          statement: meta.statement,
          inputFormat: meta.inputFormat || "",
          outputFormat: meta.outputFormat || "",
          constraints: meta.constraints || "",
          samples: meta.samples || [],
          hints: meta.hints || [],
          editorial: meta.editorial || "",
          youtube: meta.youtube || [],
          solution: { python: solution },
          tests: [],
          testsGz,
          timeLimitMs: meta.timeLimitMs || 2000,
          memoryMb: meta.memoryMb || 256,
          starter: meta.starter || {},
          origin: "official",
          status: "approved",
        },
        $setOnInsert: { order: 1000 },
      },
      { upsert: true }
    );
    loaded++;
  }

  // Tracks define the recommended order of problems.
  const trackDir = path.join(ROOT, "tracks");
  let order = 0;
  const ordered = new Set<string>();
  if (existsSync(trackDir)) {
    for (const f of readdirSync(trackDir).filter((x) => x.endsWith(".json")).sort()) {
      const t = JSON.parse(readFileSync(path.join(trackDir, f), "utf8"));
      const missing = t.steps.flatMap((s: { problems: string[] }) => s.problems).filter((slug: string) => !dirs.includes(slug));
      if (missing.length) console.warn(`  track ${t.slug}: unknown problems ${missing.join(", ")}`);
      await Track.updateOne({ slug: t.slug }, { $set: t }, { upsert: true });
      for (const s of t.steps) {
        for (const slug of s.problems) {
          if (ordered.has(slug)) continue;
          ordered.add(slug);
          await Problem.updateOne({ slug }, { $set: { order: ++order } });
        }
      }
      console.log(`track: ${t.title} (${t.steps.length} steps)`);
    }
  }
  await meta.updateOne({ _id: "content" as unknown as never }, { $set: { hash, at: new Date() } }, { upsert: true });
  console.log(`problems loaded: ${loaded}`);
  if (skipped.length) console.log("skipped:\n  " + skipped.join("\n  "));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
