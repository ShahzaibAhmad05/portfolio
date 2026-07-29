import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import GoogleSignInButton from "./GoogleSignInButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Verify Admin",
  description: "Sign in via google to access your dashboard",
};

export default async function SecretDashboardSignIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/secret-dashboard/app");

  return (
    <div className="flex h-svh flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="absolute -z-1 text-6xl font-extrabold tracking-tighter text-accent font-sans lg:text-[220px]">
          Warning!
        </h1>

        <div className="flex flex-col gap-3 items-center justify-center bg-background/95 rounded-xl p-6">
          <p className="text-lg font-semibold -mt-4 z-1">
            return to the{' '}
            <Link
              href="/"
              className="text-accent hover:underline underline-offset-4 hover:text-accent-hover"
            >
              Homepage
            </Link>
            {' '}if you are not the admin
          </p>
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
