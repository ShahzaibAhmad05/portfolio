"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Message = {
  id: number;
  sender: "client" | "me";
  content: string;
};

const STARTER_MESSAGES: Record<string, string> = {
  guidance: "Hey! Saw you clicked Get Free Guidance, what are you looking to build?",
  saas: "Hey! Want to talk SaaS? Tell me a bit about what you're building.",
};

export default function ChatPage() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}

function Chat() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const chatIdRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      let chatId = localStorage.getItem("chat_id");

      if (!chatId) {
        const { data: chat } = await supabase
          .from("chats")
          .insert({})
          .select()
          .single();
        if (!chat) return;

        chatId = chat.id;
        localStorage.setItem("chat_id", chatId!);

        const code = searchParams.get("c");
        const starter = code ? STARTER_MESSAGES[code] : undefined;
        if (starter) {
          await supabase
            .from("messages")
            .insert({ chat_id: chatId, sender: "me", content: starter });
        }
      }

      chatIdRef.current = chatId;

      const { data: history } = await supabase
        .from("messages")
        .select()
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (history) setMessages(history);
      if (cancelled) return;

      channelRef.current = supabase
        .channel(`messages-${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          },
        )
        .subscribe();
    }

    init();

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !chatIdRef.current) return;

    const supabase = createClient();
    await supabase
      .from("messages")
      .insert({ chat_id: chatIdRef.current, sender: "client", content: draft });
    setDraft("");
  }

  return (
    <div className="flex flex-col h-svh px-6 md:px-10 py-6">
      <header className="flex items-center justify-between pb-4 border-b border-border-harder">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans">
          Chat
        </h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              "max-w-[80%] sm:max-w-md rounded-2xl px-4 py-3 text-sm sm:text-base font-sans " +
              (message.sender === "client"
                ? "self-end bg-accent text-surface"
                : "self-start bg-surface-muted text-foreground")
            }
          >
            {message.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={sendMessage}
        className="flex flex-row gap-2 pt-4 border-t border-border-harder"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl bg-surface-muted px-4 py-3 text-sm sm:text-base font-sans outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="rounded-2xl bg-accent text-surface px-5 py-3 text-sm sm:text-base font-sans font-bold hover:bg-accent-hover cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
}
