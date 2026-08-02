import { NextResponse } from "next/server";
import { translateText } from "@/lib/translate";

export async function POST(req: Request) {
  let body: { text?: string; to?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = body.text?.trim();
  const to = body.to?.trim();
  if (!text || !to) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const translated = await translateText(text, to);
  if (!translated) {
    return NextResponse.json({ error: "translate_failed" }, { status: 502 });
  }

  return NextResponse.json({ text: translated });
}
