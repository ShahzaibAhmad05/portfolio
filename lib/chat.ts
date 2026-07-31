import { BUTTON_LABELS } from "@/lib/stats";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveNewChatStatus(
  supabase: SupabaseClient,
  code: string | null,
) {
  const { data } = await supabase
    .from("admin_status")
    .select("status")
    .eq("id", 1)
    .maybeSingle();

  if (data?.status) return data.status as string;
  if (code && BUTTON_LABELS[code]) return BUTTON_LABELS[code];
  return "General";
}

export async function bumpChatUpdatedAt(
  supabase: SupabaseClient,
  chatId: string,
) {
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);
}

export async function markMessagesRead(
  supabase: SupabaseClient,
  chatId: string,
  sender: "client" | "me",
) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .eq("sender", sender)
    .is("read_at", null);
}
