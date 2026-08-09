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
    <div className="flex h-svh flex-col items-center justify-center bg-[#242423] px-6 py-16">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="absolute -z-1 font-sans text-6xl font-extrabold tracking-tighter text-[#D97757] lg:text-[220px]">
          Warning!
        </h1>

        <div className="z-1 flex flex-col items-center justify-center gap-4 rounded-[30px] bg-[#333331] p-8">
          <p className="-mt-1 text-lg font-semibold text-white">
            return to the{" "}
            <Link
              href="/"
              className="text-[#D97757] underline-offset-4 hover:text-[#c96747] hover:underline"
            >
              Homepage
            </Link>{" "}
            if you are not the admin
          </p>
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
