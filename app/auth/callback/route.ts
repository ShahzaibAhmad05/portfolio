import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const intent = searchParams.get("intent") ?? "admin";
  const chatId = searchParams.get("chat_id");

  if (!code) {
    return NextResponse.redirect(`${origin}/secret-dashboard?error=auth_failed`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/secret-dashboard?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email;

  if (intent === "connect") {
    if (!email || !chatId) {
      return NextResponse.redirect(`${origin}/chat?error=auth_failed`);
    }

    const { data: taken } = await supabase
      .from("chats")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (taken && taken.id !== chatId) {
      return NextResponse.redirect(`${origin}/chat?error=email_taken`);
    }

    await supabase.from("chats").update({ email }).eq("id", chatId);
    return NextResponse.redirect(`${origin}/chat`);
  }

  if (intent === "recover") {
    if (!email) {
      return NextResponse.redirect(`${origin}/chat?c=returning`);
    }

    const { data: chat } = await supabase
      .from("chats")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (chat) {
      return NextResponse.redirect(`${origin}/chat?restore=${chat.id}`);
    }
    return NextResponse.redirect(`${origin}/chat?c=returning`);
  }

  // admin (default)
  const { data: admin } = email
    ? await supabase
        .from("admins")
        .select("email")
        .eq("email", email)
        .maybeSingle()
    : { data: null };

  if (admin) {
    return NextResponse.redirect(`${origin}/secret-dashboard/app`);
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/secret-dashboard?error=not_admin`);
}
