import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { enabledOAuth, getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function Page() {
  if (await getCurrentUser()) redirect("/problems");
  return (
    <Suspense>
      <AuthForm mode="login" oauth={enabledOAuth} />
    </Suspense>
  );
}
