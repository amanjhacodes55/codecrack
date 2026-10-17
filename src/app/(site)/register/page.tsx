import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { enabledOAuth, getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign up" };

export default async function Page() {
  if (await getCurrentUser()) redirect("/problems");
  return (
    <Suspense>
      <AuthForm mode="register" oauth={enabledOAuth} />
    </Suspense>
  );
}
