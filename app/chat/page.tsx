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

  return (
    <div className="flex flex-row h-svh">
      <div className="w-1/2 min-w-0">
        <ChatStatusPanel
          status={status}
          timeRemaining={timeRemaining}
          estimatedBudget={estimatedBudget}
          adminStatusUpdatedAt={adminStatusUpdatedAt}
          actions={
            <div className="flex flex-col gap-2">
              {error && (
                <p className="text-sm text-red-500 font-sans">{error}</p>
              )}
              {email && (
                <p className="text-xs text-muted font-sans">Connected: {email}</p>
              )}
            </div>
          }
        />
      </div>
      <div className="w-1/2 min-w-0">
        <ChatThread
          messages={messages}
          draft={draft}
          onDraftChange={handleDraftChange}
          onSend={sendMessage}
          selfSender="client"
          isOtherTyping={isOtherTyping}
          chatId={chatId}
          onAttach={handleAttach}
          headerRight={
            <>
              <a
                href="https://wa.me/923184299873"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-surface-muted px-3 py-2 text-sm font-semibold font-sans hover:bg-surface border border-transparent hover:border-border"
              >
                WhatsApp
              </a>
              {!email && (
                <button
                  type="button"
                  onClick={connectGoogle}
                  className="flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm font-semibold font-sans hover:bg-surface border border-transparent hover:border-border cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Connect
                </button>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}
