/** Promote an existing account to admin:  npm run make-admin -- you@example.com */
import mongoose from "mongoose";
import { dbConnect } from "../src/lib/db";
import { User } from "../src/lib/models/User";

async function main() {
  const email = process.argv[2]?.toLowerCase();
  if (!email) throw new Error("Usage: npm run make-admin -- <email>");
  await dbConnect();
  const r = await User.updateOne({ email }, { $set: { role: "admin" } });
  console.log(r.matchedCount ? `${email} is now an admin` : `No account with email ${email} — sign up first.`);
  await mongoose.disconnect();
}
main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
