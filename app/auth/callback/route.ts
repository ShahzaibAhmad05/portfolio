import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: admin } = user?.email
        ? await supabase
            .from("admins")
            .select("email")
            .eq("email", user.email)
            .maybeSingle()
        : { data: null };

      if (admin) {
        return NextResponse.redirect(`${origin}/secret-dashboard/app`);
      }

      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/secret-dashboard?error=not_admin`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/secret-dashboard?error=auth_failed`);
}
