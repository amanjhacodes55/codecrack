import "server-only";
import { gunzipSync } from "node:zlib";

type T = { input?: string | null; output?: string | null; sample?: boolean | null };

/** Buffer from a Mongoose doc (Buffer) or a lean() result (BSON Binary). */
function toBuffer(v: unknown): Buffer | null {
  if (!v) return null;
  if (Buffer.isBuffer(v)) return v;
  const b = (v as { buffer?: unknown }).buffer;
  if (b instanceof Uint8Array) return Buffer.from(b);
  return null;
}

/** Test cases of a problem, whether stored plain (community) or gzip-compressed (official). */
export function loadTests(p: { tests?: T[] | null; testsGz?: unknown }): { input: string; output: string; sample: boolean }[] {
  const gz = toBuffer(p.testsGz);
  const raw: T[] = gz && gz.length ? JSON.parse(gunzipSync(gz).toString("utf8")) : p.tests || [];
  return raw.map((t) => ({ input: t.input ?? "", output: t.output ?? "", sample: !!t.sample }));
}
