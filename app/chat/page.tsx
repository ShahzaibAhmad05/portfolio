"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { trackButtonClick } from "@/lib/stats";
import {
  bumpChatUpdatedAt,
  bumpChatUploads,
  markMessagesReadIfFocused,
  prepareTranslatedMessage,
  resolveNewChatStatus,
} from "@/lib/chat";
import { uploadAttachment } from "@/lib/attachments";
import ChatStatusPanel from "@/app/ChatStatusPanel";
import ChatThread, { type ChatMessage } from "@/app/ChatThread";

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
  returning:
    "Welcome back. Looks like you were here before. Tell me what you need this time.",
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [estimatedBudget, setEstimatedBudget] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [adminStatusUpdatedAt, setAdminStatusUpdatedAt] = useState<
    string | null
  >(null);
  const chatIdRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const languageRef = useRef<string | null>(null);
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const errParam = searchParams.get("error");
  const error =
    errParam === "email_taken"
      ? "That Google account is already linked to another chat."
      : errParam === "auth_failed"
        ? "Google sign-in failed. Try again."
        : null;

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  function broadcastTyping(typing: boolean) {
    const channel = channelRef.current;
    if (!channel) return;
    void channel.send({
      type: "broadcast",
      event: "typing",
      payload: { sender: "client", typing },
    });
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    if (!chatIdRef.current) return;

    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      if (!value.trim()) {
        broadcastTyping(false);
        return;
      }
      broadcastTyping(true);
      if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
      typingIdleRef.current = setTimeout(() => broadcastTyping(false), 1500);
    }, 300);
  }

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      const restoreId = searchParams.get("restore");
      if (restoreId) {
        localStorage.setItem("chat_id", restoreId);
      }

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
          .select(
            "id, status, time_remaining, estimated_budget, email, language",
          )
          .single();
        if (!chat) return;

        chatId = chat.id;
        localStorage.setItem("chat_id", chatId!);
        if (!cancelled) {
          setStatus(chat.status ?? resolved);
          setTimeRemaining(chat.time_remaining);
          setEstimatedBudget(
            chat.estimated_budget == null ? null : Number(chat.estimated_budget),
          );
          setEmail(chat.email);
          setLanguage(chat.language ?? null);
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
          .select("status, time_remaining, estimated_budget, email, language")
          .eq("id", chatId)
          .maybeSingle();
        if (!cancelled && chat) {
          setStatus(chat.status ?? "");
          setTimeRemaining(chat.time_remaining);
          setEstimatedBudget(
            chat.estimated_budget == null ? null : Number(chat.estimated_budget),
          );
          setEmail(chat.email);
          setLanguage(chat.language ?? null);
        }
      }

      chatIdRef.current = chatId;
      if (!cancelled) setChatId(chatId);
      await markMessagesReadIfFocused(supabase, chatId!, "me");

      const { data: history } = await supabase
        .from("messages")
        .select()
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      if (history) setMessages(history);
      if (cancelled) return;

      channelRef.current = supabase
        .channel(`messages-${chatId}`, {
          config: { broadcast: { self: false } },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            const row = payload.new as ChatMessage;
            setMessages((prev) => [...prev, row]);
            if (row.sender === "me") {
              markMessagesReadIfFocused(supabase, chatId!, "me");
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
            const row = payload.new as ChatMessage;
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
              estimated_budget?: number | null;
              email?: string | null;
              language?: string | null;
            };
            if (row.status !== undefined) setStatus(row.status ?? "");
            if (row.time_remaining !== undefined)
              setTimeRemaining(row.time_remaining);
            if (row.estimated_budget !== undefined)
              setEstimatedBudget(
                row.estimated_budget == null
                  ? null
                  : Number(row.estimated_budget),
              );
            if (row.email !== undefined) setEmail(row.email);
            if (row.language !== undefined) setLanguage(row.language ?? null);
          },
        )
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          const data = payload as { sender?: string; typing?: boolean };
          if (data.sender !== "me") return;
          if (typingClearRef.current) clearTimeout(typingClearRef.current);
          if (data.typing) {
            setIsOtherTyping(true);
            typingClearRef.current = setTimeout(
              () => setIsOtherTyping(false),
              2000,
            );
          } else {
            setIsOtherTyping(false);
          }
        })
        .subscribe();
    }

    init();

    return () => {
      cancelled = true;
      broadcastTyping(false);
      if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function tryMark() {
      if (!chatIdRef.current) return;
      markMessagesReadIfFocused(createClient(), chatIdRef.current, "me");
    }
    window.addEventListener("focus", tryMark);
    document.addEventListener("visibilitychange", tryMark);
    return () => {
      window.removeEventListener("focus", tryMark);
      document.removeEventListener("visibilitychange", tryMark);
    };
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !chatIdRef.current) return;

    const text = draft.trim();
    setDraft("");
    broadcastTyping(false);
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);

    const payload = await prepareTranslatedMessage(
      text,
      languageRef.current,
      "en",
    );

    const supabase = createClient();
    await supabase.from("messages").insert({
      chat_id: chatIdRef.current,
      sender: "client",
      content: payload.content,
      translated: payload.translated,
    });
    await bumpChatUpdatedAt(supabase, chatIdRef.current);
  }

  async function connectGoogle() {
    if (!chatIdRef.current) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent=connect&chat_id=${chatIdRef.current}`,
      },
    });
  }

  async function handleAttach(
    file: File,
    onProgress: (pct: number) => void,
  ) {
    if (!chatIdRef.current) throw new Error("no_chat");
    const id = chatIdRef.current;
    const { key, size, filename } = await uploadAttachment({
      chatId: id,
      file,
      onProgress,
    });
    const supabase = createClient();
    await supabase.from("messages").insert({
      chat_id: id,
      sender: "client",
      content: filename,
      attachment: key,
    });
    await bumpChatUploads(supabase, id, size);
    await bumpChatUpdatedAt(supabase, id);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
  }

  return (
    <div className="flex h-svh flex-col bg-[#242423] lg:flex-row">
      <div className="min-h-[28vh] w-full shrink-0 lg:h-full lg:w-[48%]">
        <ChatStatusPanel
          variant="client"
          status={status}
          timeRemaining={timeRemaining}
          estimatedBudget={estimatedBudget}
          adminStatusUpdatedAt={adminStatusUpdatedAt}
        />
      </div>
      <div className="min-h-0 w-full flex-1 p-4 sm:p-6 lg:w-[52%] lg:py-8 lg:pr-8 lg:pl-2">
        <ChatThread
          variant="client"
          messages={messages}
          draft={draft}
          onDraftChange={handleDraftChange}
          onSend={sendMessage}
          selfSender="client"
          isOtherTyping={isOtherTyping}
          chatId={chatId}
          onAttach={handleAttach}
          email={email}
          error={error}
          onConnectGoogle={connectGoogle}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
