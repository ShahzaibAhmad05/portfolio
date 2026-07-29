"use client";

import Link from "next/link";
import { useState } from "react";

type Message = {
  role: "them" | "me";
  text: string;
};

const placeholderMessages: Message[] = [
  { role: "them", text: "Hey, I saw your profile and wanted to talk about a project." },
  { role: "me", text: "Sounds good, what are you looking to build?" },
  { role: "them", text: "A desktop app that needs to run offline as an exe." },
];

export default function ChatPage() {
  const [messages] = useState<Message[]>(placeholderMessages);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col h-svh px-6 md:px-10 py-6">
      <header className="flex items-center justify-between pb-4 border-b border-border-harder">
        <Link
          href="/"
          className="text-sm text-muted hover:text-foreground hover:underline underline-offset-4 font-sans"
        >
          &larr; Back
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans">
          Chat
        </h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-6">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={
              "max-w-[80%] sm:max-w-md rounded-2xl px-4 py-3 text-sm sm:text-base font-sans " +
              (message.role === "me"
                ? "self-end bg-accent text-surface"
                : "self-start bg-surface-muted text-foreground")
            }
          >
            {message.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDraft("");
        }}
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
