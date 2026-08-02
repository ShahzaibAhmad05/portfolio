import { NextResponse } from "next/server";
import { presignGet } from "@/lib/r2";

export async function POST(req: Request) {
  let body: { chatId?: string; key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const chatId = body.chatId?.trim();
  const key = body.key?.trim();
  if (!chatId || !key) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const prefix = `chats/${chatId}/`;
  if (!key.startsWith(prefix) || key.includes("..")) {
    return NextResponse.json({ error: "invalid_key" }, { status: 403 });
  }

  try {
    const url = await presignGet(key);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "sign_failed" }, { status: 500 });
  }
}
