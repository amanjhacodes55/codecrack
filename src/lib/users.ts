import { User } from "@/lib/models/User";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function uniqueUsername(seed: string): Promise<string> {
  const base =
    seed
      .toLowerCase()
      .replace(/@.*/, "")
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "coder";
  let candidate = base;
  for (let i = 0; i < 50; i++) {
    if (!(await User.exists({ username: candidate }))) return candidate;
    candidate = `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
  }
  return `${base}${Date.now()}`;
}

/** Role a brand-new account should get: admin for the very first account or a listed admin email. */
export async function initialRole(email: string): Promise<"admin" | "user"> {
  if (adminEmails().includes(email.toLowerCase())) return "admin";
  const anyAdmin = await User.exists({ role: "admin" });
  return anyAdmin ? "user" : "admin";
}
