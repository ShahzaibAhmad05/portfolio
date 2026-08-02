import { createClient } from "@/lib/supabase/client";

export function todayDate() {
  return new Date().toLocaleDateString("en-CA");
}

export const BUTTON_LABELS: Record<string, string> = {
  enter: "Enter Chat",
  how: "Want to know How?",
  discuss: "Discuss for FREE",
  contact: "Contact Me",
  saas: "SaaS",
  tkinter: "Python Tkinter / PyQt6 Apps",
  exe: "Code to Exe",
  extensions: "Browser Extensions",
  ai: "AI Automation",
  cv: "Computer Vision / OpenCV",
  returning: "Returning visitor",
};

export function monthStart(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function prevMonthStart(d = new Date()) {
  return monthStart(new Date(d.getFullYear(), d.getMonth() - 1, 1));
}

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
