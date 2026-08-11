import { createClient } from "@/lib/supabase/client";

export function todayDate() {
  return new Date().toLocaleDateString("en-CA");
}

export const BUTTON_LABELS: Record<string, string> = {
  discuss: "Discuss An Idea",
  send_email: "Send an Email",
  whatsapp: "WhatsApp",
  discord: "Discord",
  linkedin: "LinkedIn",
  mail: "Email",
  github: "GitHub",
  saas: "SaaS",
  ai: "AI automation",
  flutter: "flutter apps",
  exe: "code to exe",
  python: "python",
  extensions: "chrome/firefox extensions",
  electron: "electron apps",
  desktop: "desktop apps",
  cv: "computer vision",
  dotnet: "dotnet development",
  figma: "figma web design",
};

export async function trackVisitor() {
  const today = todayDate();
  const last = localStorage.getItem("last_visit_date");
  if (last === today) return;

  localStorage.setItem("last_visit_date", today);
  const supabase = createClient();
  const { data } = await supabase
    .from("daily_visitors")
    .select("count")
    .eq("date", today)
    .maybeSingle();

  if (data) {
    await supabase
      .from("daily_visitors")
      .update({ count: data.count + 1 })
      .eq("date", today);
  } else {
    await supabase.from("daily_visitors").insert({ date: today, count: 1 });
  }
}

export async function trackButtonClick(code: string | null) {
  if (!code) return;
  const label = BUTTON_LABELS[code];
  if (!label) return;

  const today = todayDate();
  const supabase = createClient();
  const { data } = await supabase
    .from("button_clicks")
    .select("clicks")
    .eq("button_text", label)
    .eq("date", today)
    .maybeSingle();

  if (data) {
    await supabase
      .from("button_clicks")
      .update({ clicks: data.clicks + 1 })
      .eq("button_text", label)
      .eq("date", today);
  } else {
    await supabase
      .from("button_clicks")
      .insert({ button_text: label, date: today, clicks: 1 });
  }
}
