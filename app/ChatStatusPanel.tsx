type ChatStatusPanelProps = {
  status: string;
  timeRemaining: string | null;
  adminStatusUpdatedAt: string | null;
};

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ChatStatusPanel({
  status,
  timeRemaining,
  adminStatusUpdatedAt,
}: ChatStatusPanelProps) {
  return (
    <div className="flex flex-col gap-6 h-full border-r border-border-harder px-6 py-6 font-sans">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted">Status</span>
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {status || "—"}
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
          Admin status updated
        </span>
        <p className="text-lg text-foreground">
          {formatWhen(adminStatusUpdatedAt)}
        </p>
      </div>
    </div>
  );
}
