import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { adminEmails, initialRole, uniqueUsername } from "@/lib/users";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Email",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      await dbConnect();
      const user = await User.findOne({ email: credentials.email.toLowerCase().trim() }).select("+passwordHash");
      if (!user || !user.passwordHash || user.banned) return null;
      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;
      return { id: String(user._id), name: user.name, email: user.email, image: user.image };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })
  );
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET })
  );
}

export const enabledOAuth = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  github: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
};

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;
      if (!user.email) return false;
      await dbConnect();
      const email = user.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (existing) {
        if (existing.banned) return false;
        const update: Record<string, unknown> = { $addToSet: { providers: account.provider } };
        if (!existing.image && user.image) update.$set = { image: user.image };
        await User.updateOne({ _id: existing._id }, update);
        return true;
      }
      await User.create({
        name: user.name || email.split("@")[0],
        email,
        username: await uniqueUsername(email),
        image: user.image || "",
        providers: [account.provider],
        role: await initialRole(email),
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        await dbConnect();
        const u = await User.findOne({ email: user.email.toLowerCase() }).select("_id").lean();
        if (u) token.uid = String(u._id);
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.uid) return session;
      await dbConnect();
      const u = await User.findById(token.uid).select("name email username image role banned").lean();
      if (!u || u.banned) return { ...session, user: undefined } as unknown as Session;
      const role = adminEmails().includes(u.email) ? "admin" : (u.role as "user" | "admin");
      session.user = {
        id: String(u._id),
        name: u.name,
        email: u.email,
        username: u.username,
        image: u.image || undefined,
        role,
      };
      return session;
    },
  },
};

export type SessionUser = Session["user"];

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}
