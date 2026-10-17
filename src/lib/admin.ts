import "server-only";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?callbackUrl=/admin");
  if (me.role !== "admin") notFound();
  return me;
}
