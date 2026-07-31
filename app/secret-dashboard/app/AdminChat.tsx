"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { bumpChatUpdatedAt, markMessagesRead } from "@/lib/chat";
import ChatStatusPanel from "@/app/ChatStatusPanel";
import ReadTicks from "@/app/ReadTicks";

type Chat = {
  id: string;
  status: string | null;
  time_remaining: string | null;
  updated_at: string | null;
  not_a_client: boolean;
};

type Message = {
  id: number;
  sender: "client" | "me";
  content: string;
  created_at: string;
  read_at: string | null;
  chat_id?: string;
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

export default function AdminChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [adminStatusDraft, setAdminStatusDraft] = useState("");
  const [adminStatusUpdatedAt, setAdminStatusUpdatedAt] = useState<
    string | null
  >(null);
  const [chatStatusDraft, setChatStatusDraft] = useState("");
  const [chatTimeDraft, setChatTimeDraft] = useState("");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const chatsChannelRef = useRef<RealtimeChannel | null>(null);
  const unreadChannelRef = useRef<RealtimeChannel | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const activeChat = chats.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

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
      .select("id, status, time_remaining, updated_at, not_a_client")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const sorted = sortChats(data);
        setChats(sorted);
        if (sorted[0]) {
          setActiveId(sorted[0].id);
          setChatStatusDraft(sorted[0].status ?? "");
          setChatTimeDraft(toDatetimeLocal(sorted[0].time_remaining));
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
          const row = payload.new as Chat;
          setChats((prev) =>
            sortChats([row, ...prev.filter((c) => c.id !== row.id)]),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chats" },
        (payload) => {
          const row = payload.new as Chat;
          setChats((prev) =>
            sortChats(
              prev.map((c) => (c.id === row.id ? { ...c, ...row } : c)),
            ),
          );
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
              setChatStatusDraft(fallback?.status ?? "");
              setChatTimeDraft(toDatetimeLocal(fallback?.time_remaining ?? null));
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
          const row = payload.new as Message & { chat_id: string };
          if (row.sender !== "client") return;
          if (row.chat_id === activeIdRef.current) {
            markMessagesRead(supabase, row.chat_id, "client");
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
      await markMessagesRead(supabase, activeId!, "client");
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

      channelRef.current = supabase
        .channel(`admin-messages-${activeId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${activeId}`,
          },
          (payload) => {
            const row = payload.new as Message;
            setMessages((prev) => [...prev, row]);
            if (row.sender === "client") {
              markMessagesRead(supabase, activeId!, "client");
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
            const row = payload.new as Message;
            setMessages((prev) =>
              prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)),
            );
          },
        )
        .subscribe();
    }

    load();

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [activeId]);

  function selectChat(id: string) {
    if (id === activeId) return;
    const chat = chats.find((c) => c.id === id);
    setMessages([]);
    setDraft("");
    setChatStatusDraft(chat?.status ?? "");
    setChatTimeDraft(toDatetimeLocal(chat?.time_remaining ?? null));
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
    await supabase
      .from("chats")
      .update({ status: chatStatusDraft, time_remaining })
      .eq("id", activeId);
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, status: chatStatusDraft, time_remaining }
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
      setChatStatusDraft(fallback?.status ?? "");
      setChatTimeDraft(toDatetimeLocal(fallback?.time_remaining ?? null));
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

    const supabase = createClient();
    await supabase
      .from("messages")
      .insert({ chat_id: activeId, sender: "me", content: draft });
    await bumpChatUpdatedAt(supabase, activeId);
    setDraft("");
  }

  return (
    <section className="flex flex-row h-svh min-h-0">
      <div className="flex flex-col gap-1 px-2 py-3 border-r border-border-harder h-full overflow-y-auto">
        {chats.map((chat) => {
          const count = unread[chat.id] ?? 0;
          const isActive = chat.id === activeId;
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
              title={chat.not_a_client ? `${chat.id} (not a client)` : chat.id}
              className={circleClass}
            >
              {chat.id.charAt(0)}
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 w-64 shrink-0 border-r border-border-harder px-3 py-4 font-sans overflow-y-auto">
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

        <div className="flex flex-col gap-2 border-t border-border-harder pt-4">
          <span className="text-xs uppercase tracking-wider text-muted">
            Active chat
          </span>
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
          <button
            type="button"
            onClick={saveActiveChat}
            disabled={!activeId}
            className="rounded-lg bg-accent text-surface px-3 py-1.5 text-sm font-bold hover:bg-accent-hover cursor-pointer disabled:opacity-50"
          >
            Save chat
          </button>
          <label className="flex flex-row items-center gap-2 text-sm text-foreground cursor-pointer disabled:opacity-50">
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

      <div className="flex flex-row flex-1 min-w-0 min-h-0">
        <div className="w-1/2 min-w-0">
          <ChatStatusPanel
            status={activeChat?.status ?? ""}
            timeRemaining={activeChat?.time_remaining ?? null}
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
                  (message.sender === "me"
                    ? "self-end bg-accent text-surface"
                    : "self-start bg-surface-muted text-foreground")
                }
              >
                <span className="block">{message.content}</span>
                <span
                  className={
                    "flex items-center gap-1 mt-1 text-xs " +
                    (message.sender === "me"
                      ? "justify-end opacity-80"
                      : "justify-start text-muted")
                  }
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {message.sender === "me" && (
                    <ReadTicks readAt={message.read_at} light />
                  )}
                </span>
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
              disabled={!activeId}
              placeholder="Type a message..."
              className="flex-1 rounded-2xl bg-surface-muted px-4 py-3 text-sm sm:text-base font-sans outline-none placeholder:text-muted disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!activeId}
              className="rounded-2xl bg-accent text-surface px-5 py-3 text-sm sm:text-base font-sans font-bold hover:bg-accent-hover cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
