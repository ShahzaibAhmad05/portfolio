"use client";

import Image from "next/image";
import Link from "next/link";
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
  variant?: "default" | "client" | "admin";
  email?: string | null;
  error?: string | null;
  onConnectGoogle?: () => void;
  onLogout?: () => void;
  adminTitle?: string;
  adminSubtitle?: string;
};

const NEAR_BOTTOM_PX = 80;

function displayText(message: ChatMessage, mine: boolean) {
  if (mine) return message.content;
  return message.translated || message.content;
}

function formatMsgTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function AttachmentBody({
  chatId,
  message,
  mine,
  variant,
}: {
  chatId: string;
  message: ChatMessage;
  mine: boolean;
  variant: "default" | "client";
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
          className={
            variant === "client"
              ? "max-h-64 max-w-full rounded-[20px] object-contain"
              : "max-h-64 max-w-full rounded-xl object-contain"
          }
        />
      </a>
    );
  }

  if (variant === "client") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download={name}
        className="flex w-full items-center gap-3 rounded-[30px] bg-[#20201D] px-4 py-5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/chat/doc-icon.svg" alt="" className="h-9 w-8 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-center text-[18px] font-semibold text-white sm:text-[20px]">
          {name}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/chat/download-icon.svg"
          alt="Download"
          className="h-7 w-7 shrink-0"
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

function ClientHeader({
  email,
  error,
  menuOpen,
  setMenuOpen,
  onConnectGoogle,
  onLogout,
}: {
  email?: string | null;
  error?: string | null;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onConnectGoogle?: () => void;
  onLogout?: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen, setMenuOpen]);

  return (
    <div className="relative z-20 flex items-center justify-between gap-3 rounded-t-[30px] bg-[rgba(64,64,61,0.4)] px-6 py-5">
      <div className="flex min-w-0 items-center gap-4">
        <Image
          src="/chat/chat-pfp.png"
          alt="Shahzaib"
          width={70}
          height={70}
          className="size-[56px] shrink-0 rounded-full object-cover sm:size-[70px]"
          priority
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[22px] leading-tight text-white sm:text-[28px]">
            Shahzaib
          </span>
          <span className="text-[15px] leading-tight text-[#25D366]">Online</span>
        </div>
      </div>

      <div ref={menuRef} className="relative shrink-0">
        <div className="flex items-center gap-3 rounded-[30px] bg-[#474744] px-4 py-3 sm:px-5">
          <a
            href="https://wa.me/923184299873"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="WhatsApp"
            className="flex size-10 items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chat/whatsapp.svg" alt="" className="size-10" />
          </a>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-9 items-center justify-center cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chat/menu-dots.svg" alt="" className="w-8" />
          </button>
        </div>

        {menuOpen && (
          <div className="absolute top-0 right-0 z-30 w-[281px] overflow-hidden rounded-[30px] bg-[#3F3F3C] shadow-lg">
            <div className="rounded-b-[30px] bg-[#242421] px-5 py-4">
              {email ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-3 text-left text-[20px] text-white cursor-pointer sm:text-[22px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/chat/logout-icon.svg" alt="" className="h-7 w-7" />
                  logout
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onConnectGoogle?.();
                  }}
                  className="flex w-full items-center gap-3 text-left text-[20px] text-white cursor-pointer sm:text-[22px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/chat/logout-icon.svg" alt="" className="h-7 w-7" />
                  login
                </button>
              )}
            </div>
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-4 text-[20px] text-white sm:text-[22px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/chat/chevron-left.svg" alt="" className="size-8" />
              homepage
            </Link>
          </div>
        )}
      </div>

      {error && (
        <p className="absolute top-full left-6 right-6 mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function AdminHeader({
  title,
  subtitle,
  isOtherTyping,
  headerRight,
}: {
  title?: string;
  subtitle?: string;
  isOtherTyping: boolean;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-t-[30px] bg-[rgba(64,64,61,0.4)] px-6 py-5">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[20px] leading-tight text-white sm:text-[24px]">
          {title || "Select a chat"}
        </span>
        <span className="text-[13px] leading-tight text-[#25D366]">
          {isOtherTyping ? "typing…" : subtitle || "Online"}
        </span>
      </div>
      {headerRight && (
        <div className="flex shrink-0 items-center gap-2">{headerRight}</div>
      )}
    </div>
  );
}

function ClientReadTicks({ readAt }: { readAt: string | null }) {
  if (!readAt) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 11"
        className="inline-block h-[11px] w-5 text-black/50"
        aria-label="Delivered"
      >
        <path
          d="M14.7245 1.44815L5.54757 10.6251C5.04764 11.125 4.2363 11.125 3.73638 10.6251L0 6.8887L1.44815 5.44056L4.64147 8.63388L13.2764 0L14.7245 1.44815Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/chat/read-ticks.svg"
      alt="Read"
      className="inline-block h-[11px] w-5"
    />
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
  variant = "default",
  email,
  error,
  onConnectGoogle,
  onLogout,
  adminTitle,
  adminSubtitle,
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const nearBottomRef = useRef(true);
  const prevLenRef = useRef(0);
  const [pendingUnread, setPendingUnread] = useState(0);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  if (variant === "client" || variant === "admin") {
    return (
      <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-[30px] bg-[#333331]">
        {variant === "client" ? (
          <ClientHeader
            email={email}
            error={error}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onConnectGoogle={onConnectGoogle}
            onLogout={onLogout}
          />
        ) : (
          <AdminHeader
            title={adminTitle}
            subtitle={adminSubtitle}
            isOtherTyping={isOtherTyping}
            headerRight={headerRight}
          />
        )}

        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex h-full flex-col gap-4 overflow-y-auto px-6 py-6"
          >
            {messages.map((message) => {
              const mine = message.sender === selfSender;
              const hasAttachment = !!message.attachment;
              const isFileCard =
                hasAttachment &&
                !isImageAttachment(message.content || "") &&
                !isImageAttachment(message.attachment || "");

              return (
                <div
                  key={message.id}
                  className={
                    "flex max-w-[85%] flex-col sm:max-w-[462px] " +
                    (mine ? "self-end" : "self-start")
                  }
                >
                  {isFileCard && chatId ? (
                    <>
                      <AttachmentBody
                        chatId={chatId}
                        message={message}
                        mine={mine}
                        variant="client"
                      />
                      <span className="mt-1 flex items-center justify-end gap-1.5 px-2 text-[11px] font-semibold text-black">
                        {formatMsgTime(message.created_at)}
                        {mine && <ClientReadTicks readAt={message.read_at} />}
                      </span>
                    </>
                  ) : (
                    <div
                      className={
                        "px-6 py-4 font-sans text-[16px] leading-6 text-[#E2E2E2] sm:text-[18px] " +
                        (mine
                          ? "rounded-[30px] rounded-tr-none bg-[#52524F]"
                          : "rounded-[30px] rounded-tr-none bg-[#474744]")
                      }
                    >
                      {hasAttachment && chatId ? (
                        <AttachmentBody
                          chatId={chatId}
                          message={message}
                          mine={mine}
                          variant="client"
                        />
                      ) : (
                        <span className="block">
                          {displayText(message, mine)}
                        </span>
                      )}
                      <span className="mt-2 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-black">
                        {formatMsgTime(message.created_at)}
                        {mine && <ClientReadTicks readAt={message.read_at} />}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {isOtherTyping && (
              <div className="self-start max-w-[85%] rounded-[30px] rounded-tr-none bg-[#474744] px-6 py-4 font-sans text-[18px] tracking-widest text-[#BCBCBC] sm:max-w-[462px]">
                [...]
              </div>
            )}
          </div>

          {pendingUnread > 0 && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#D97757] text-white shadow-md cursor-pointer hover:bg-[#c96747]"
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
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-4 font-bold text-white">
                {pendingUnread > 99 ? "99+" : pendingUnread}
              </span>
            </button>
          )}
        </div>

        {(uploadPct !== null || uploadError) && (
          <div className="px-6 pb-2 font-sans text-xs">
            {uploadPct !== null && (
              <div className="flex flex-col gap-1">
                <span className="text-[#BCBCBC]">Uploading… {uploadPct}%</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#474744]">
                  <div
                    className="h-full bg-[#D97757] transition-[width]"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
              </div>
            )}
            {uploadError && (
              <p className="mt-1 text-red-400">{uploadError}</p>
            )}
          </div>
        )}

        <form
          onSubmit={onSend}
          className="flex items-center gap-3 rounded-b-[30px] bg-[rgba(64,64,61,0.4)] px-6 py-5"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || !chatId || uploadPct !== null}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || !chatId || uploadPct !== null}
          />
          <button
            type="button"
            disabled={disabled || !chatId || uploadPct !== null}
            onClick={() => fileInputRef.current?.click()}
            className="flex size-[56px] shrink-0 items-center justify-center rounded-full bg-[#474744] cursor-pointer disabled:opacity-50 sm:size-[69px]"
            aria-label="Attach file"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chat/paperclip.svg" alt="" className="h-6 w-5" />
          </button>
          <button
            type="button"
            disabled={disabled || !chatId || uploadPct !== null}
            onClick={() => imageInputRef.current?.click()}
            className="flex size-[56px] shrink-0 items-center justify-center rounded-full bg-[#474744] cursor-pointer disabled:opacity-50 sm:size-[69px]"
            aria-label="Attach image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chat/image-icon.svg" alt="" className="size-7" />
          </button>
          <input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            disabled={disabled || uploadPct !== null}
            placeholder="type here"
            className="h-[56px] min-w-0 flex-1 rounded-[30px] bg-[#474744] px-8 text-[20px] text-white outline-none placeholder:text-[#BCBCBC] disabled:opacity-50 sm:h-[69px] sm:text-[24px]"
          />
          <button type="submit" className="sr-only" tabIndex={-1}>
            Send
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-col px-5 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3 border-b border-border-harder pb-4">
        <h1 className="font-sans text-xl font-extrabold tracking-tight sm:text-2xl">
          Chat
        </h1>
        <div className="flex items-center gap-2">{headerRight}</div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex h-full flex-col gap-3 overflow-y-auto py-6"
        >
          {messages.map((message) => {
            const mine = message.sender === selfSender;
            const hasAttachment = !!message.attachment;
            return (
              <div
                key={message.id}
                className={
                  "max-w-[80%] rounded-2xl px-4 py-3 font-sans text-sm sm:max-w-md sm:text-base " +
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
                    variant="default"
                  />
                ) : (
                  <span className="block">{displayText(message, mine)}</span>
                )}
                <span
                  className={
                    "mt-1 flex items-center gap-1 text-xs " +
                    (mine
                      ? "justify-end opacity-80"
                      : "justify-start text-muted")
                  }
                >
                  {formatMsgTime(message.created_at)}
                  {mine && <ReadTicks readAt={message.read_at} light />}
                </span>
              </div>
            );
          })}
          {isOtherTyping && (
            <div className="max-w-[80%] self-start rounded-2xl bg-surface-muted px-4 py-3 font-sans text-sm tracking-widest text-muted sm:max-w-md sm:text-base">
              [...]
            </div>
          )}
        </div>

        {pendingUnread > 0 && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute right-3 bottom-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-accent text-surface shadow-md hover:bg-accent-hover"
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
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] leading-4 font-bold text-white">
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
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full bg-accent transition-[width]"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
            </div>
          )}
          {uploadError && <p className="mt-1 text-red-500">{uploadError}</p>}
        </div>
      )}

      <form
        onSubmit={onSend}
        className="flex flex-row gap-2 border-t border-border-harder pt-4"
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
          className="cursor-pointer rounded-2xl border border-transparent bg-surface-muted px-3 py-3 font-sans text-sm font-bold hover:border-border hover:bg-surface disabled:opacity-50 sm:text-base"
          aria-label="Attach file"
        >
          +
        </button>
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          disabled={disabled || uploadPct !== null}
          placeholder="Type a message..."
          className="flex-1 rounded-2xl bg-surface-muted px-4 py-3 font-sans text-sm outline-none placeholder:text-muted disabled:opacity-50 sm:text-base"
        />
        <button
          type="submit"
          disabled={disabled || uploadPct !== null}
          className="cursor-pointer rounded-2xl bg-accent px-5 py-3 font-sans text-sm font-bold text-surface hover:bg-accent-hover disabled:opacity-50 sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
}
