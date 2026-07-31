"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { trackButtonClick } from "@/lib/stats";
import {
  bumpChatUpdatedAt,
  markMessagesRead,
  resolveNewChatStatus,
} from "@/lib/chat";
import ChatStatusPanel from "@/app/ChatStatusPanel";
import ReadTicks from "@/app/ReadTicks";

type Message = {
  id: number;
  sender: "client" | "me";
  content: string;
  read_at: string | null;
};

const STARTER_MESSAGES: Record<string, string> = {
  enter: "Hey! What are you looking to build?",
  how: "Curious how I build 3x faster? Ask me anything.",
  discuss: "Hey! Saw you clicked Discuss for FREE, what are you looking to build?",
  contact: "Hey! You reached out via Contact Me, how can I help?",
  saas: "Hey! Want to talk SaaS? Tell me a bit about what you're building.",
  tkinter: "Hey! Looking for a Python desktop app (Tkinter / PyQt6)?",
  exe: "Hey! Need something packed into an exe?",
  extensions: "Hey! Building a browser extension?",
  ai: "Hey! Want to automate something with AI?",
  cv: "Hey! Working on computer vision / OpenCV?",
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
  const [status, setStatus] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [adminStatusUpdatedAt, setAdminStatusUpdatedAt] = useState<
    string | null
  >(null);
  const chatIdRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      let chatId = localStorage.getItem("chat_id");
      const code = searchParams.get("c");
      const now = new Date().toISOString();

      const { data: adminRow } = await supabase
        .from("admin_status")
        .select("status, updated_at")
        .eq("id", 1)
        .maybeSingle();
      if (!cancelled) setAdminStatusUpdatedAt(adminRow?.updated_at ?? null);

      if (!chatId) {
        const resolved = await resolveNewChatStatus(supabase, code);
        const { data: chat } = await supabase
          .from("chats")
          .insert({ status: resolved, updated_at: now })
          .select("id, status, time_remaining")
          .single();
        if (!chat) return;

        chatId = chat.id;
        localStorage.setItem("chat_id", chatId!);
        if (!cancelled) {
          setStatus(chat.status ?? resolved);
          setTimeRemaining(chat.time_remaining);
        }

        await trackButtonClick(code);
        const starter = code ? STARTER_MESSAGES[code] : undefined;
        if (starter) {
          await supabase
            .from("messages")
            .insert({ chat_id: chatId, sender: "me", content: starter });
          await bumpChatUpdatedAt(supabase, chatId!);
        }
      } else {
        const { data: chat } = await supabase
          .from("chats")
          .select("status, time_remaining")
          .eq("id", chatId)
          .maybeSingle();
        if (!cancelled && chat) {
          setStatus(chat.status ?? "");
          setTimeRemaining(chat.time_remaining);
        }
      }

      chatIdRef.current = chatId;
      await markMessagesRead(supabase, chatId!, "me");

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
            const row = payload.new as Message;
            setMessages((prev) => [...prev, row]);
            if (row.sender === "me") {
              markMessagesRead(supabase, chatId!, "me");
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            const row = payload.new as Message;
            setMessages((prev) =>
              prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)),
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "chats",
            filter: `id=eq.${chatId}`,
          },
          (payload) => {
            const row = payload.new as {
              status?: string;
              time_remaining?: string | null;
            };
            if (row.status !== undefined) setStatus(row.status ?? "");
            if (row.time_remaining !== undefined)
              setTimeRemaining(row.time_remaining);
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
    await supabase.from("messages").insert({
      chat_id: chatIdRef.current,
      sender: "client",
      content: draft,
    });
    await bumpChatUpdatedAt(supabase, chatIdRef.current);
    setDraft("");
  }

  return (
    <div className="flex flex-row h-svh">
      <div className="w-1/2 min-w-0">
        <ChatStatusPanel
          status={status}
          timeRemaining={timeRemaining}
          adminStatusUpdatedAt={adminStatusUpdatedAt}
        />
      </div>
      <div className="w-1/2 min-w-0 flex flex-col px-6 py-6">
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
              <span className="block">{message.content}</span>
              {message.sender === "client" && (
                <span className="flex justify-end mt-1">
                  <ReadTicks readAt={message.read_at} light />
                </span>
              )}
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
    </div>
  );
}
