"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { monthStart, prevMonthStart } from "@/lib/stats";

type VisitorRow = { date: string; count: number };
type ClickRow = { button_text: string; date: string; clicks: number };

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function monthEnd(d: Date) {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
}

export default function AdminStats() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [monthIncome, setMonthIncome] = useState(0);
  const [prevIncome, setPrevIncome] = useState<number | null>(null);
  const [incomeDraft, setIncomeDraft] = useState("0");

  const selectedDate = useMemo(() => new Date(year, month, 1), [year, month]);
  const rangeStart = monthStart(selectedDate);
  const rangeEnd = monthEnd(selectedDate);
  const prevKey = prevMonthStart(selectedDate);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => y - 4 + i);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("daily_visitors")
      .select("date, count")
      .gte("date", rangeStart)
      .lte("date", rangeEnd)
      .order("date", { ascending: true })
      .then(({ data }) => {
        if (data) setVisitors(data);
      });

    supabase
      .from("button_clicks")
      .select("button_text, date, clicks")
      .gte("date", rangeStart)
      .lte("date", rangeEnd)
      .order("date", { ascending: true })
      .then(({ data }) => {
        if (data) setClicks(data);
      });

    supabase
      .from("income")
      .select("month, amount")
      .in("month", [rangeStart, prevKey])
      .then(({ data }) => {
        const curr = data?.find((r) => String(r.month).startsWith(rangeStart.slice(0, 7)));
        const prev = data?.find((r) => String(r.month).startsWith(prevKey.slice(0, 7)));
        const currAmt = curr ? Number(curr.amount) : 0;
        setMonthIncome(currAmt);
        setIncomeDraft(String(currAmt));
        setPrevIncome(prev ? Number(prev.amount) : null);
      });
  }, [rangeStart, rangeEnd, prevKey]);

  const clickTotals = Object.values(
    clicks.reduce<Record<string, { name: string; clicks: number }>>(
      (acc, row) => {
        if (!acc[row.button_text]) {
          acc[row.button_text] = { name: row.button_text, clicks: 0 };
        }
        acc[row.button_text].clicks += row.clicks;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.clicks - a.clicks);

  const pct =
    prevIncome == null || prevIncome === 0
      ? null
      : ((monthIncome - prevIncome) / prevIncome) * 100;

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  async function saveIncome() {
    const amount = Number(incomeDraft) || 0;
    const supabase = createClient();
    await supabase.from("income").upsert({ month: rangeStart, amount });
    setMonthIncome(amount);
  }

  function adjust(delta: number) {
    setIncomeDraft(String((Number(incomeDraft) || 0) + delta));
  }

  const label = `${MONTHS[month]} ${year}`;

  const tickStyle = { fontSize: 11, fill: "#BCBCBC" };
  const tooltipStyle = {
    background: "#333331",
    border: "1px solid #474744",
    borderRadius: 12,
    color: "#E2E2E2",
  };

  return (
    <section className="flex flex-col gap-8 bg-[#242423] px-6 py-10 font-sans md:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-[#8f8f8c]">
            Stats period
          </span>
          <p className="text-xl font-extrabold tracking-tight text-white">
            {label}
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="cursor-pointer rounded-full border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Prev
          </button>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-xl bg-[#474744] px-3 py-2 text-sm text-white outline-none"
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl bg-[#474744] px-3 py-2 text-sm text-white outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="cursor-pointer rounded-full border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-[30px] bg-[#333331] p-6 lg:col-span-1">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-[#8f8f8c]">
              Income
            </span>
            <p className="text-4xl font-extrabold tracking-tight text-white">
              {monthIncome.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </p>
            <p
              className={
                "text-sm font-semibold " +
                (pct == null
                  ? "text-[#8f8f8c]"
                  : pct >= 0
                    ? "text-[#25D366]"
                    : "text-red-400")
              }
            >
              {pct == null
                ? "No prior-month baseline"
                : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs prior month`}
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <button
              type="button"
              onClick={() => adjust(-100)}
              className="cursor-pointer rounded-full border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              -100
            </button>
            <input
              type="number"
              step="0.01"
              value={incomeDraft}
              onChange={(e) => setIncomeDraft(e.target.value)}
              className="flex-1 rounded-xl bg-[#474744] px-3 py-2 text-sm text-white outline-none"
            />
            <button
              type="button"
              onClick={() => adjust(100)}
              className="cursor-pointer rounded-full border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
            >
              +100
            </button>
          </div>
          <button
            type="button"
            onClick={saveIncome}
            className="cursor-pointer rounded-full bg-[#D97757] px-4 py-2 text-sm font-bold text-white hover:bg-[#c96747]"
          >
            Save income
          </button>
        </div>

        <div className="flex flex-col gap-3 rounded-[30px] bg-[#333331] p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-white">Daily visitors</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitors}>
                <CartesianGrid stroke="#474744" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={tickStyle} />
                <YAxis allowDecimals={false} tick={tickStyle} width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#D97757"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[30px] bg-[#333331] p-6">
        <h2 className="text-lg font-bold text-white">Button clicks (totals)</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clickTotals} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid stroke="#474744" strokeDasharray="4 4" />
              <XAxis type="number" allowDecimals={false} tick={tickStyle} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={tickStyle}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="clicks" fill="#D97757" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
