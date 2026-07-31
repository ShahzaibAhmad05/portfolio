"use client";

import { useEffect, useState } from "react";
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
  Legend,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

type VisitorRow = { date: string; count: number };
type ClickRow = { button_text: string; date: string; clicks: number };

export default function AdminStats() {
  const [visitors, setVisitors] = useState<VisitorRow[]>([]);
  const [clicks, setClicks] = useState<ClickRow[]>([]);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("daily_visitors")
      .select("date, count")
      .order("date", { ascending: true })
      .then(({ data }) => {
        if (data) setVisitors(data);
      });

    supabase
      .from("button_clicks")
      .select("button_text, date, clicks")
      .order("date", { ascending: true })
      .then(({ data }) => {
        if (data) setClicks(data);
      });
  }, []);

  const buttonKeys = [...new Set(clicks.map((c) => c.button_text))];
  const clickByDate = Object.values(
    clicks.reduce<Record<string, Record<string, string | number>>>(
      (acc, row) => {
        if (!acc[row.date]) acc[row.date] = { date: row.date };
        acc[row.date][row.button_text] = row.clicks;
        return acc;
      },
      {},
    ),
  );

  return (
    <section className="flex flex-col gap-8 px-4 py-8 border-t border-border-harder">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold font-sans">Daily visitors</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold font-sans">Button clicks</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clickByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {buttonKeys.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={`hsl(${(i * 47) % 360} 55% 50%)`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
