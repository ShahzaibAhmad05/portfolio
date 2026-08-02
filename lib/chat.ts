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

export async function bumpChatUploads(
  supabase: SupabaseClient,
  chatId: string,
  size: number,
) {
  const { data } = await supabase
    .from("chats")
    .select("current_uploads")
    .eq("id", chatId)
    .maybeSingle();
  const current = Number(data?.current_uploads ?? 0);
  await supabase
    .from("chats")
    .update({ current_uploads: current + size })
    .eq("id", chatId);
  return current + size;
}

export function isTabFocused() {
  return (
    typeof document !== "undefined" &&
    document.visibilityState === "visible" &&
    document.hasFocus()
  );
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

export async function markMessagesReadIfFocused(
  supabase: SupabaseClient,
  chatId: string,
  sender: "client" | "me",
) {
  if (!isTabFocused()) return;
  await markMessagesRead(supabase, chatId, sender);
}

/** content = typed text; translated = optional target-language text. Fail-open. */
export async function prepareTranslatedMessage(
  text: string,
  language: string | null | undefined,
  target: "en" | string,
) {
  if (!language) {
    return { content: text, translated: null as string | null };
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, to: target }),
    });
    if (!res.ok) {
      return { content: text, translated: null as string | null };
    }
    const json = (await res.json()) as { text?: string };
    if (!json.text) {
      return { content: text, translated: null as string | null };
    }
    return { content: text, translated: json.text };
  } catch {
    return { content: text, translated: null as string | null };
  }
}
