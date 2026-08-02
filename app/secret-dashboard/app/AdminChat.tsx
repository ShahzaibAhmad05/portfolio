"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  bumpChatUpdatedAt,
  bumpChatUploads,
  markMessagesReadIfFocused,
  prepareTranslatedMessage,
} from "@/lib/chat";
import { formatBytes, uploadAttachment } from "@/lib/attachments";
import ChatStatusPanel from "@/app/ChatStatusPanel";
import ChatThread, { type ChatMessage } from "@/app/ChatThread";

type Chat = {
  id: string;
  status: string | null;
  time_remaining: string | null;
  updated_at: string | null;
  not_a_client: boolean;
  estimated_budget: number | null;
  email: string | null;
  nickname: string | null;
  language: string | null;
  current_uploads: number;
  max_uploads: number;
};

function sortChats(list: Chat[]) {
  return [...list].sort((a, b) => {
    const aT = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const bT = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    return bT - aT;
  });
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function normalizeChat(row: Chat): Chat {
  return {
    ...row,
    estimated_budget:
      row.estimated_budget == null ? null : Number(row.estimated_budget),
    nickname: row.nickname ?? null,
    language: row.language ?? null,
    current_uploads: Number(row.current_uploads ?? 0),
    max_uploads: Number(row.max_uploads ?? 524288000),
  };
}

function bytesToMbInput(bytes: number) {
  return String(bytes / (1024 * 1024));
}

function mbInputToBytes(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 1024 * 1024);
}

export default function AdminChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [adminStatusDraft, setAdminStatusDraft] = useState("");
  const [adminStatusUpdatedAt, setAdminStatusUpdatedAt] = useState<
    string | null
  >(null);
  const [chatStatusDraft, setChatStatusDraft] = useState("");
  const [chatTimeDraft, setChatTimeDraft] = useState("");
  const [budgetDraft, setBudgetDraft] = useState("");
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [languageDraft, setLanguageDraft] = useState("");
  const [maxUploadsDraft, setMaxUploadsDraft] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const chatsChannelRef = useRef<RealtimeChannel | null>(null);
  const unreadChannelRef = useRef<RealtimeChannel | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const languageRef = useRef<string | null>(null);
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeChat = chats.find((c) => c.id === activeId) ?? null;

  function applyChatDrafts(chat: Chat | null | undefined) {
    setChatStatusDraft(chat?.status ?? "");
    setChatTimeDraft(toDatetimeLocal(chat?.time_remaining ?? null));
    setBudgetDraft(
      chat?.estimated_budget == null ? "" : String(chat.estimated_budget),
    );
    setNicknameDraft(chat?.nickname ?? "");
    setLanguageDraft(chat?.language ?? "");
    setMaxUploadsDraft(
      chat ? bytesToMbInput(chat.max_uploads) : "",
    );
    languageRef.current = chat?.language ?? null;
  }

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    languageRef.current = activeChat?.language ?? null;
  }, [activeChat?.language]);

  function broadcastTyping(typing: boolean) {
    const channel = channelRef.current;
    if (!channel) return;
    void channel.send({
      type: "broadcast",
      event: "typing",
      payload: { sender: "me", typing },
    });
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    if (!activeIdRef.current) return;

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

    supabase
      .from("admin_status")
      .select("status, updated_at")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setAdminStatusDraft(data.status ?? "");
        setAdminStatusUpdatedAt(data.updated_at ?? null);
      });

    supabase
      .from("chats")
      .select(
        "id, status, time_remaining, updated_at, not_a_client, estimated_budget, email, nickname, language, current_uploads, max_uploads",
      )
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const sorted = sortChats(data.map((c) => normalizeChat(c as Chat)));
        setChats(sorted);
        if (sorted[0]) {
          setActiveId(sorted[0].id);
          applyChatDrafts(sorted[0]);
        }
      });

    supabase
      .from("messages")
      .select("chat_id")
      .eq("sender", "client")
      .is("read_at", null)
      .then(({ data }) => {
        if (!data) return;
        const counts: Record<string, number> = {};
        for (const row of data) {
          const id = row.chat_id as string;
          counts[id] = (counts[id] ?? 0) + 1;
        }
        setUnread(counts);
      });

    chatsChannelRef.current = supabase
      .channel("admin-chats-list")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        (payload) => {
          const row = normalizeChat(payload.new as Chat);
          setChats((prev) =>
            sortChats([row, ...prev.filter((c) => c.id !== row.id)]),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chats" },
        (payload) => {
          const row = normalizeChat(payload.new as Chat);
          setChats((prev) =>
            sortChats(
              prev.map((c) => (c.id === row.id ? { ...c, ...row } : c)),
            ),
          );
          if (row.id === activeIdRef.current) {
            languageRef.current = row.language;
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chats" },
        (payload) => {
          const row = payload.old as { id: string };
          setChats((prev) => {
            const next = prev.filter((c) => c.id !== row.id);
            if (activeIdRef.current === row.id) {
              const fallback = next[0] ?? null;
              setActiveId(fallback?.id ?? null);
              setMessages([]);
              setDraft("");
              applyChatDrafts(fallback);
            }
            return next;
          });
          setUnread((prev) => {
            const next = { ...prev };
            delete next[row.id];
            return next;
          });
        },
      )
      .subscribe();

    unreadChannelRef.current = supabase
      .channel("admin-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as ChatMessage & { chat_id: string };
          if (row.sender !== "client") return;
          if (row.chat_id === activeIdRef.current) {
            markMessagesReadIfFocused(supabase, row.chat_id, "client");
            return;
          }
          setUnread((prev) => ({
            ...prev,
            [row.chat_id]: (prev[row.chat_id] ?? 0) + 1,
          }));
        },
      )
      .subscribe();

    return () => {
      if (chatsChannelRef.current)
        supabase.removeChannel(chatsChannelRef.current);
      if (unreadChannelRef.current)
        supabase.removeChannel(unreadChannelRef.current);
      chatsChannelRef.current = null;
      unreadChannelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;

    const supabase = createClient();
    let cancelled = false;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    async function load() {
      await markMessagesReadIfFocused(supabase, activeId!, "client");
      setUnread((prev) => {
        const next = { ...prev };
        delete next[activeId!];
        return next;
      });

      const { data } = await supabase
        .from("messages")
        .select()
        .eq("chat_id", activeId)
        .order("created_at", { ascending: true });
      if (!cancelled && data) setMessages(data);
      if (cancelled) return;

      // Same topic as client chat so typing broadcast is shared.
      channelRef.current = supabase
        .channel(`messages-${activeId}`, {
          config: { broadcast: { self: false } },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${activeId}`,
          },
          (payload) => {
            const row = payload.new as ChatMessage;
            setMessages((prev) => [...prev, row]);
            if (row.sender === "client") {
              markMessagesReadIfFocused(supabase, activeId!, "client");
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${activeId}`,
          },
          (payload) => {
            const row = payload.new as ChatMessage;
            setMessages((prev) =>
              prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)),
            );
          },
        )
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          const data = payload as { sender?: string; typing?: boolean };
          if (data.sender !== "client") return;
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

    load();

    return () => {
      cancelled = true;
      broadcastTyping(false);
      if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [activeId]);

  useEffect(() => {
    function tryMark() {
      if (!activeIdRef.current) return;
      markMessagesReadIfFocused(
        createClient(),
        activeIdRef.current,
        "client",
      );
    }
    window.addEventListener("focus", tryMark);
    document.addEventListener("visibilitychange", tryMark);
    return () => {
      window.removeEventListener("focus", tryMark);
      document.removeEventListener("visibilitychange", tryMark);
    };
  }, []);

  function selectChat(id: string) {
    if (id === activeId) return;
    const chat = chats.find((c) => c.id === id);
    broadcastTyping(false);
    setIsOtherTyping(false);
    setMessages([]);
    setDraft("");
    applyChatDrafts(chat);
    setActiveId(id);
  }

  async function saveAdminStatus() {
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .from("admin_status")
      .update({ status: adminStatusDraft, updated_at: now })
      .eq("id", 1);
    setAdminStatusUpdatedAt(now);
  }

  async function clearAdminStatus() {
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .from("admin_status")
      .update({ status: "", updated_at: now })
      .eq("id", 1);
    setAdminStatusDraft("");
    setAdminStatusUpdatedAt(now);
  }

  async function saveActiveChat() {
    if (!activeId) return;
    const supabase = createClient();
    const time_remaining = chatTimeDraft
      ? new Date(chatTimeDraft).toISOString()
      : null;
    const estimated_budget =
      budgetDraft.trim() === "" ? null : Number(budgetDraft);
    const nickname = nicknameDraft.trim() === "" ? null : nicknameDraft.trim();
    const language = languageDraft.trim() === "" ? null : languageDraft.trim();
    const max_uploads = mbInputToBytes(maxUploadsDraft);
    if (max_uploads == null) return;
    await supabase
      .from("chats")
      .update({
        status: chatStatusDraft,
        time_remaining,
        estimated_budget,
        nickname,
        language,
        max_uploads,
      })
      .eq("id", activeId);
    languageRef.current = language;
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              status: chatStatusDraft,
              time_remaining,
              estimated_budget,
              nickname,
              language,
              max_uploads,
            }
          : c,
      ),
    );
  }

  async function toggleNotAClient() {
    if (!activeId || !activeChat) return;
    const next = !activeChat.not_a_client;
    const supabase = createClient();
    await supabase
      .from("chats")
      .update({ not_a_client: next })
      .eq("id", activeId);
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, not_a_client: next } : c,
      ),
    );
  }

  async function deleteActiveChat() {
    if (!activeId) return;
    if (!window.confirm("Delete this chat and all its messages?")) return;

    const id = activeId;
    const supabase = createClient();
    const { error } = await supabase.from("chats").delete().eq("id", id);
    if (error) return;

    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      const fallback = next[0] ?? null;
      setActiveId(fallback?.id ?? null);
      applyChatDrafts(fallback);
      return next;
    });
    setUnread((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setMessages([]);
    setDraft("");
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;

    const text = draft.trim();
    setDraft("");
    broadcastTyping(false);
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);

    const lang = languageRef.current;
    const payload = await prepareTranslatedMessage(
      text,
      lang,
      lang ?? "en",
    );

    const supabase = createClient();
    await supabase.from("messages").insert({
      chat_id: activeId,
      sender: "me",
      content: payload.content,
      translated: payload.translated,
    });
    await bumpChatUpdatedAt(supabase, activeId);
  }

  async function handleAttach(
    file: File,
    onProgress: (pct: number) => void,
  ) {
    if (!activeId) throw new Error("no_chat");
    const id = activeId;
    const { key, size, filename } = await uploadAttachment({
      chatId: id,
      file,
      onProgress,
    });
    const supabase = createClient();
    await supabase.from("messages").insert({
      chat_id: id,
      sender: "me",
      content: filename,
      attachment: key,
    });
    const next = await bumpChatUploads(supabase, id, size);
    await bumpChatUpdatedAt(supabase, id);
    setChats((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, current_uploads: next } : c,
      ),
    );
  }

  return (
    <section className="flex flex-row h-svh min-h-0">
      <div className="flex flex-col gap-1 px-2 py-3 border-r border-border-harder h-full overflow-y-auto">
        {chats.map((chat) => {
          const count = unread[chat.id] ?? 0;
          const isActive = chat.id === activeId;
          const label = chat.nickname?.trim() || chat.id;
          const initial = (chat.nickname?.trim() || chat.id).charAt(0);
          let circleClass =
            "relative rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold uppercase cursor-pointer shrink-0 ";
          if (chat.not_a_client) {
            circleClass += isActive
              ? "bg-muted text-surface ring-2 ring-muted"
              : "bg-border-harder text-muted hover:bg-muted/40";
          } else if (isActive) {
            circleClass += "bg-accent text-surface";
          } else {
            circleClass += "bg-surface hover:bg-surface-muted";
          }
          return (
            <button
              key={chat.id}
              type="button"
              onClick={() => selectChat(chat.id)}
              title={
                chat.not_a_client ? `${label} (not a client)` : label
              }
              className={circleClass}
            >
              {initial}
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-row flex-1 min-w-0 min-h-0">
        <div className="w-1/2 min-w-0">
          <ChatStatusPanel
            status={activeChat?.status ?? ""}
            timeRemaining={activeChat?.time_remaining ?? null}
            estimatedBudget={activeChat?.estimated_budget ?? null}
            adminStatusUpdatedAt={adminStatusUpdatedAt}
          >
            <div className="flex flex-col gap-4 border-t border-border-harder pt-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider text-muted">
                  Global admin status
                </span>
                <input
                  value={adminStatusDraft}
                  onChange={(e) => setAdminStatusDraft(e.target.value)}
                  className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none"
                  placeholder="Default status for new chats"
                />
                <div className="flex flex-row gap-2">
                  <button
                    type="button"
                    onClick={saveAdminStatus}
                    className="rounded-lg bg-accent text-surface px-3 py-1.5 text-sm font-bold hover:bg-accent-hover cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={clearAdminStatus}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm cursor-pointer hover:bg-surface-muted"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider text-muted">
                  Active chat
                </span>
                {activeChat?.email && (
                  <p className="text-xs text-muted">Email: {activeChat.email}</p>
                )}
                <input
                  value={nicknameDraft}
                  onChange={(e) => setNicknameDraft(e.target.value)}
                  disabled={!activeId}
                  className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none disabled:opacity-50"
                  placeholder="Nickname (admin only)"
                />
                <input
                  value={languageDraft}
                  onChange={(e) => setLanguageDraft(e.target.value)}
                  disabled={!activeId}
                  className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none disabled:opacity-50"
                  placeholder="Language code (e.g. ur, es) — empty = off"
                />
                <input
                  value={chatStatusDraft}
                  onChange={(e) => setChatStatusDraft(e.target.value)}
                  disabled={!activeId}
                  className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none disabled:opacity-50"
                  placeholder="Chat status"
                />
                <input
                  type="datetime-local"
                  value={chatTimeDraft}
                  onChange={(e) => setChatTimeDraft(e.target.value)}
                  disabled={!activeId}
                  className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none disabled:opacity-50"
                />
                <input
                  type="number"
                  step="0.01"
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  disabled={!activeId}
                  className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none disabled:opacity-50"
                  placeholder="Estimated budget"
                />
                <p className="text-xs text-muted">
                  Uploads used:{" "}
                  {activeChat
                    ? `${formatBytes(activeChat.current_uploads)} / ${formatBytes(activeChat.max_uploads)}`
                    : "-"}
                </p>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={maxUploadsDraft}
                  onChange={(e) => setMaxUploadsDraft(e.target.value)}
                  disabled={!activeId}
                  className="rounded-lg border bg-surface px-3 py-2 text-sm outline-none disabled:opacity-50"
                  placeholder="Max uploads (MB)"
                />
                <button
                  type="button"
                  onClick={saveActiveChat}
                  disabled={!activeId}
                  className="rounded-lg bg-accent text-surface px-3 py-1.5 text-sm font-bold hover:bg-accent-hover cursor-pointer disabled:opacity-50"
                >
                  Save chat
                </button>
                <label className="flex flex-row items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!activeChat?.not_a_client}
                    onChange={toggleNotAClient}
                    disabled={!activeId}
                    className="cursor-pointer"
                  />
                  Not a client
                </label>
                <button
                  type="button"
                  onClick={deleteActiveChat}
                  disabled={!activeId}
                  className="rounded-lg border border-red-500/50 text-red-500 px-3 py-1.5 text-sm font-bold hover:bg-red-500/10 cursor-pointer disabled:opacity-50"
                >
                  Delete chat
                </button>
              </div>
            </div>
          </ChatStatusPanel>
        </div>
        <div className="w-1/2 min-w-0">
          <ChatThread
            messages={messages}
            draft={draft}
            onDraftChange={handleDraftChange}
            onSend={sendMessage}
            disabled={!activeId}
            selfSender="me"
            isOtherTyping={isOtherTyping}
            chatId={activeId}
            onAttach={handleAttach}
          />
        </div>
      </div>
    </section>
  );
}
