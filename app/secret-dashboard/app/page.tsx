import type { Metadata } from "next";
import { Typewriter } from "@/components/typewriter";

export const metadata: Metadata = {
  title: "System Admin",
  description: "System admin has signed in. Showing dashboard.",
};

const recentItems = [
  { title: "Placeholder inquiry", meta: "Just now · Unread" },
  { title: "Placeholder project update", meta: "2h ago · Open" },
  { title: "Placeholder message", meta: "Yesterday · Replied" },
];

export default function SecretDashboardApp() {
  return (
    <div className="flex flex-col px-6 py-10 sm:py-14 mx-auto w-full max-w-5xl gap-10">
      <header className="flex flex-row gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          <Typewriter text="Nothing new; All caught up." ms={30} />
        </h1>
      </header>

      <section className="flex flex-row grap-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <span className="text-xs text-muted sm:text-sm">Unread Messages</span>
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            $0
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-foreground">
              Recent activity
            </h2>
            <p className="text-sm text-muted">Latest inquiries and updates.</p>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {recentItems.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0"
              >
                <span className="text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="text-xs text-muted">{item.meta}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-foreground">
              Quick actions
            </h2>
            <p className="text-sm text-muted">Shortcuts for later.</p>
          </div>
          <div className="flex flex-col gap-2">
            {["New project", "View inquiries", "Settings"].map((action) => (
              <button
                key={action}
                type="button"
                disabled
                className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-left text-sm text-muted"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
