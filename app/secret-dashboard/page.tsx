import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Secret Dashboard",
  description: "Sign in to access the secret dashboard.",
};

export default function SecretDashboardSignIn() {
  return (
    <div className="flex h-svh flex-col items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="absolute -z-1 text-6xl font-extrabold tracking-tighter text-accent font-sans lg:text-[220px]">
          Warning!
        </h1>

        <div className="flex flex-col gap-3 items-center justify-center bg-background/95 rounded-xl p-6">
          <p className="text-lg font-semibold -mt-4 z-1">
            return to the{' '}
            <Link
              href="/"
              className="text-accent hover:underline underline-offset-4 hover:text-accent-hover"
            >
              Homepage
            </Link>
            {' '}if you are not the admin
          </p>
          <Link
            href="/secret-dashboard/app"
            className="flex flex-row items-center justify-center gap-3 rounded-xl px-5 py-1.5 border-2 border-transparent hover:border-border bg-surface-muted text-lg text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-7 w-7"
              aria-hidden
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Verify
          </Link>
        </div>
      </div>
    </div>
  );
}
