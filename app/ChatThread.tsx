"use client";

import { useEffect, useRef, useState } from "react";
import ReadTicks from "@/app/ReadTicks";
import { isImageAttachment, signDownloadUrl } from "@/lib/attachments";

export type ChatMessage = {
  id: number;
  sender: "client" | "me";
  content: string;
  translated?: string | null;
  attachment?: string | null;
  created_at?: string;
  read_at: string | null;
};

type ChatThreadProps = {
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  disabled?: boolean;
  /** Whose bubbles are on the right (outgoing). Client: client. Admin: me. */
  selfSender: "client" | "me";
  headerRight?: React.ReactNode;
  isOtherTyping?: boolean;
  chatId?: string | null;
  onAttach?: (
    file: File,
    onProgress: (pct: number) => void,
  ) => Promise<void>;
};

const NEAR_BOTTOM_PX = 80;

function displayText(message: ChatMessage, mine: boolean) {
  if (mine) return message.content;
  return message.translated || message.content;
}

function AttachmentBody({
  chatId,
  message,
  mine,
}: {
  chatId: string;
  message: ChatMessage;
  mine: boolean;
}) {
  const key = message.attachment!;
  const name = message.content || key.split("/").pop() || "file";
  const isImage = isImageAttachment(name) || isImageAttachment(key);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    signDownloadUrl(chatId, key)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chatId, key]);

  if (failed) {
    return <span className="block text-xs opacity-80">Couldnt load file</span>;
  }

  if (!url) {
    return <span className="block text-xs opacity-80">Loading...</span>;
  }

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="max-h-64 max-w-full rounded-xl object-contain"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={name}
      className={
        "flex items-center gap-2 underline-offset-2 hover:underline " +
        (mine ? "text-surface" : "text-foreground")
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 shrink-0"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
          clipRule="evenodd"
        />
      </svg>
      <span className="break-all">{name}</span>
    </a>
  );
}

export default function ChatThread({
  messages,
  draft,
  onDraftChange,
  onSend,
  disabled,
  selfSender,
  headerRight,
  isOtherTyping = false,
  chatId,
  onAttach,
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nearBottomRef = useRef(true);
  const prevLenRef = useRef(0);
  const [pendingUnread, setPendingUnread] = useState(0);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function isNearBottom() {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
  }

  function scrollToBottom() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    nearBottomRef.current = true;
    setPendingUnread(0);
  }

  function onScroll() {
    const near = isNearBottom();
    nearBottomRef.current = near;
    if (near) setPendingUnread(0);
  }

  useEffect(() => {
    const prev = prevLenRef.current;
    const next = messages.length;
    prevLenRef.current = next;
    if (next === 0) return;

    if (prev === 0) {
      scrollToBottom();
      return;
    }
    if (next <= prev) return;

    const last = messages[next - 1];
    const mine = last.sender === selfSender;
    if (mine || nearBottomRef.current) {
      scrollToBottom();
    } else {
      setPendingUnread((n) => n + (next - prev));
    }
  }, [messages, selfSender]);

  useEffect(() => {
    if (isOtherTyping && nearBottomRef.current) scrollToBottom();
  }, [isOtherTyping]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !chatId || disabled || uploadPct !== null) return;

    if (!onAttach) return;

    setUploadError(null);
    setUploadPct(0);
    try {
      await onAttach(file, setUploadPct);
    } catch (err) {
      const code = err instanceof Error ? err.message : "upload_failed";
      const msg =
        code === "quota_exceeded"
          ? "Upload limit reached for this chat."
          : code === "file_too_large"
            ? "File too large (max 500MB)."
            : code === "type_not_allowed"
              ? "File type not allowed."
              : "Upload failed.";
      setUploadError(msg);
    } finally {
      setUploadPct(null);
    }
  }

  return (
    <div className="min-w-0 flex flex-col h-full px-5 sm:px-6 py-6">
      <header className="flex items-center justify-between gap-3 pb-4 border-b border-border-harder">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans">
          Chat
        </h1>
        <div className="flex items-center gap-2">{headerRight}</div>
      </header>

      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="h-full overflow-y-auto flex flex-col gap-3 py-6"
        >
          {messages.map((message) => {
            const mine = message.sender === selfSender;
            const hasAttachment = !!message.attachment;
            return (
              <div
                key={message.id}
                className={
                  "max-w-[80%] sm:max-w-md rounded-2xl px-4 py-3 text-sm sm:text-base font-sans " +
                  (mine
                    ? "self-end bg-accent text-surface"
                    : "self-start bg-surface-muted text-foreground")
                }
              >
                {hasAttachment && chatId ? (
                  <AttachmentBody
                    chatId={chatId}
                    message={message}
                    mine={mine}
                  />
                ) : (
                  <span className="block">{displayText(message, mine)}</span>
                )}
                <span
                  className={
                    "flex items-center gap-1 mt-1 text-xs " +
                    (mine
                      ? "justify-end opacity-80"
                      : "justify-start text-muted")
                  }
                >
                  {message.created_at &&
                    new Date(message.created_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  {mine && <ReadTicks readAt={message.read_at} light />}
                </span>
              </div>
            );
          })}
          {isOtherTyping && (
            <div className="self-start max-w-[80%] sm:max-w-md rounded-2xl px-4 py-3 text-sm sm:text-base font-sans bg-surface-muted text-muted tracking-widest">
              [...]
            </div>
          )}
        </div>

        {pendingUnread > 0 && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-surface shadow-md cursor-pointer hover:bg-accent-hover"
            aria-label="Jump to latest messages"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M10 3a.75.75 0 01.75.75v10.19l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3.75A.75.75 0 0110 3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 font-bold">
              {pendingUnread > 99 ? "99+" : pendingUnread}
            </span>
          </button>
        )}
      </div>

      {(uploadPct !== null || uploadError) && (
        <div className="pt-3 font-sans text-xs">
          {uploadPct !== null && (
            <div className="flex flex-col gap-1">
              <span className="text-muted">Uploading… {uploadPct}%</span>
              <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
                <div
                  className="h-full bg-accent transition-[width]"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            </div>
          )}
          {uploadError && (
            <p className="text-red-500 mt-1">{uploadError}</p>
          )}
        </div>
      )}

      <form
        onSubmit={onSend}
        className="flex flex-row gap-2 pt-4 border-t border-border-harder"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || !chatId || uploadPct !== null}
        />
        <button
          type="button"
          disabled={disabled || !chatId || uploadPct !== null}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl bg-surface-muted px-3 py-3 text-sm sm:text-base font-sans font-bold hover:bg-surface border border-transparent hover:border-border cursor-pointer disabled:opacity-50"
          aria-label="Attach file"
        >
          +
        </button>
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          disabled={disabled || uploadPct !== null}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl bg-surface-muted px-4 py-3 text-sm sm:text-base font-sans outline-none placeholder:text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || uploadPct !== null}
          className="rounded-2xl bg-accent text-surface px-5 py-3 text-sm sm:text-base font-sans font-bold hover:bg-accent-hover cursor-pointer disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
