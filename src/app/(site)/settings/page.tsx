import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/lib/models/User";
import { plain } from "@/lib/serialize";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?callbackUrl=/settings");
  await dbConnect();
  const u = await User.findById(me.id).select("name username email image bio college location github linkedin website targetExam targetDate preferredLanguage providers").lean();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted">This is what others see on your public profile.</p>
      <SettingsForm user={plain(u) as unknown as Parameters<typeof SettingsForm>[0]["user"]} />
    </div>
  );
}
