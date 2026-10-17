import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type Handler<C> = (req: Request, ctx: C, user: SessionUser) => Promise<Response>;

/** Wrap a route handler: connects DB and requires a signed-in user (optionally admin). */
export function withUser<C>(handler: Handler<C>, opts: { admin?: boolean } = {}) {
  return async (req: Request, ctx: C) => {
    await dbConnect();
    const user = await getCurrentUser();
    if (!user) return error("Please sign in first.", 401);
    if (opts.admin && user.role !== "admin") return error("Admins only.", 403);
    try {
      return await handler(req, ctx, user);
    } catch (e) {
      if (e instanceof SyntaxError) return error("Invalid JSON body.", 400);
      console.error(e);
      return error(e instanceof Error ? e.message : "Something went wrong", 500);
    }
  };
}

/** Very small in-memory rate limiter (per key). Good enough for a single server. */
const buckets = new Map<string, number[]>();
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    buckets.set(key, arr);
    return false;
  }
  arr.push(now);
  buckets.set(key, arr);
  return true;
}
