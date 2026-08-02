import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isAllowedMime,
  MAX_FILE_BYTES,
  safeFilename,
} from "@/lib/attachments";
import { presignPut } from "@/lib/r2";

export async function POST(req: Request) {
  let body: {
    chatId?: string;
    filename?: string;
    contentType?: string;
    size?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const chatId = body.chatId?.trim();
  const filename = body.filename?.trim();
  const contentType = body.contentType?.trim() || "application/octet-stream";
  const size = Number(body.size);

  if (!chatId || !filename || !Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }
  if (!isAllowedMime(contentType)) {
    return NextResponse.json({ error: "type_not_allowed" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: chat, error } = await supabase
    .from("chats")
    .select("id, current_uploads, max_uploads")
    .eq("id", chatId)
    .maybeSingle();

  if (error || !chat) {
    return NextResponse.json({ error: "chat_not_found" }, { status: 404 });
  }

  const current = Number(chat.current_uploads ?? 0);
  const max = Number(chat.max_uploads ?? 0);
  if (current + size > max) {
    return NextResponse.json({ error: "quota_exceeded" }, { status: 403 });
  }

  const key = `chats/${chatId}/${crypto.randomUUID()}/${safeFilename(filename)}`;

  try {
    const uploadUrl = await presignPut(key, contentType);
    return NextResponse.json({ uploadUrl, key });
  } catch {
    return NextResponse.json({ error: "sign_failed" }, { status: 500 });
  }
}
