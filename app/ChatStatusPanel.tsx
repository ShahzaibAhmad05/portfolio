"use client";

import { useEffect, useState, type ReactNode } from "react";

type ChatStatusPanelProps = {
  status: string;
  timeRemaining: string | null;
  estimatedBudget: number | null;
  adminStatusUpdatedAt: string | null;
  actions?: ReactNode;
  children?: ReactNode;
  variant?: "default" | "client";
};

function formatWhen(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatBudget(value: number | null) {
  if (value == null) return "-";
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatBudgetPill(value: number | null) {
  if (value == null) return "-";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}$`;
}

function formatCountdown(iso: string | null, now: number) {
  if (!iso) return "-";
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return "-";
  const diff = Math.max(0, end - now);
  const totalMins = Math.floor(diff / 60000);
  const days = Math.floor(totalMins / (60 * 24));
  const hrs = Math.floor((totalMins % (60 * 24)) / 60);
  const mins = totalMins % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hrs > 0 || days > 0) parts.push(`${hrs} hrs`);
  parts.push(`${mins} mins`);
  return parts.join(" ");
}

function resolveMode(
  status: string,
  timeRemaining: string | null,
  estimatedBudget: number | null,
): "idle" | "progress" | "completed" {
  const s = status.trim().toLowerCase();
  if (/complet|done|finished|delivered/.test(s)) return "completed";
  if (
    timeRemaining ||
    estimatedBudget != null ||
    /progress|working|wip|active|started/.test(s)
  ) {
    return "progress";
  }
  return "idle";
}

function ClientStatusPanel({
  status,
  timeRemaining,
  estimatedBudget,
}: {
  status: string;
  timeRemaining: string | null;
  estimatedBudget: number | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  const mode = resolveMode(status, timeRemaining, estimatedBudget);

  useEffect(() => {
    if (mode !== "progress" || !timeRemaining) return;
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, [mode, timeRemaining]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 font-sans text-center">
      {mode === "idle" && (
        <p className="max-w-[640px] text-[40px] leading-[0.95] font-black tracking-tight text-white sm:text-[56px] lg:text-[80px] lg:leading-[85px]">
          Your <span className="text-[#D97757]">project updates</span> will show
          here{" "}
          <span className="text-white/40">once we start</span>
        </p>
      )}

      {mode === "progress" && (
        <div className="flex w-full max-w-[640px] flex-col items-center gap-2">
          <p className="text-[40px] leading-[0.95] font-black tracking-tight text-white sm:text-[52px] lg:text-[60px] lg:leading-[85px]">
            Work in <span className="text-[#D97757]">progress</span>
          </p>
          <div className="mt-2 flex w-full max-w-md flex-col gap-3">
            <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:justify-between">
              <span className="text-base font-semibold text-white sm:text-[20px]">
                Time remaining:
              </span>
              <span className="rounded-xl bg-[#333331] px-5 py-2 text-[15px] text-[#E2E2E2] sm:text-[18px]">
                {formatCountdown(timeRemaining, now)}
              </span>
            </div>
            <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:justify-between">
              <span className="text-base font-semibold text-white sm:text-[20px]">
                Estimated budget:
              </span>
              <span className="min-w-[160px] rounded-xl bg-[#333331] px-5 py-2 text-center text-[15px] text-[#E2E2E2] sm:text-[18px]">
                {formatBudgetPill(estimatedBudget)}
              </span>
            </div>
          </div>
        </div>
      )}

      {mode === "completed" && (
        <div className="flex w-full max-w-[640px] flex-col items-center gap-2">
          <p className="text-[40px] leading-[0.95] font-black tracking-tight text-white sm:text-[52px] lg:text-[60px] lg:leading-[85px]">
            Task <span className="text-[#D97757]">completed!</span>
          </p>
          <div className="mt-4 flex flex-row flex-wrap items-center justify-center gap-3">
            <span className="text-base font-semibold text-white sm:text-[20px]">
              Estimated budget:
            </span>
            <span className="min-w-[160px] rounded-xl bg-[#333331] px-5 py-2 text-center text-[15px] text-[#E2E2E2] sm:text-[18px]">
              {formatBudgetPill(estimatedBudget)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatStatusPanel({
  status,
  timeRemaining,
  estimatedBudget,
  adminStatusUpdatedAt,
  actions,
  children,
  variant = "default",
}: ChatStatusPanelProps) {
  if (variant === "client") {
    return (
      <ClientStatusPanel
        status={status}
        timeRemaining={timeRemaining}
        estimatedBudget={estimatedBudget}
      />
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-r border-border-harder px-5 py-6 font-sans sm:px-6">
      {actions}
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted">Status</span>
        <p className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {status || "-"}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted">
          Time remaining
        </span>
        <p className="text-lg text-foreground">{formatWhen(timeRemaining)}</p>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted">
          Estimated budget
        </span>
        <p className="text-lg text-foreground">{formatBudget(estimatedBudget)}</p>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted">
          Admin status updated
        </span>
        <p className="text-lg text-foreground">
          {formatWhen(adminStatusUpdatedAt)}
        </p>
      </div>
      {children}
    </div>
  );
}
