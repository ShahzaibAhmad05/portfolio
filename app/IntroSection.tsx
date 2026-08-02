"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function IntroSection() {
  const router = useRouter();
  const [showBeenHere, setShowBeenHere] = useState(false);

  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.3 });

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();

    const maxMove = 4;
    x.set(((e.clientX - (left + width / 2)) / (width / 2)) * maxMove);
    y.set(((e.clientY - (top + height / 2)) / (height / 2)) * maxMove);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  async function recoverAccount() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent=recover`,
      },
    });
  }

  return (
    <section className="relative flex flex-col h-svh items-center justify-center">
      <div className="flex flex-row items-center justify-center gap-6 mb-5 sm:mb-0">
        <Image
          src="/pfp.png"
          alt="Profile photo"
          width={500}
          height={500}
          priority
          className="hidden lg:block shrink-0 lg:h-100 lg:w-100 grayscale mb-18"
        />
        <div className="flex flex-col gap-8 sm:gap-10">
          <h1 className="text-foreground flex flex-col cursor-default font-sans">
            <div className="flex flex-col sm:flex-row sm:gap-3 z-1 tracking-tighter text-6xl sm:text-6xl font-extrabold">
              <span className="leading-[0.9] sm:leading-none">Building</span>
              <span className="leading-[0.9] sm:leading-none">Software</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-3 text-[80px] leading-none sm:text-8xl text-accent uppercase font-extrabold sm:-mt-4 tracking-tighter">
              <span className="leading-[0.8] sm:leading-none">3X</span>
              <span className="leading-[0.8] sm:leading-none">Faster</span>
            </div>
            <span className="text-5xl sm:text-6xl tracking-tight -mt-1 sm:-mt-6 z-1 font-extrabold">
              than your AI
            </span>
            <Link
              href="/chat?c=how"
              className="text-muted text-sm font-normal hover:text-foreground hover:underline underline-offset-4 cursor-pointer ml-1 sm:-mt-1"
            >
              Want to know How?
            </Link>
          </h1>
          <div className="flex flex-col items-center gap-1">
            <motion.button
              ref={ref}
              onClick={() => router.push("/chat?c=enter")}
              style={{ x: springX, y: springY }}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              className="group bg-accent text-surface py-6 sm:py-6 rounded-3xl text-[33px] sm:text-4xl font-sans font-extrabold flex flex-row items-center justify-center gap-2 hover:bg-accent-hover w-full cursor-pointer px-7"
            >
              Enter Chat
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-8 animate-nudge-x group-hover:[animation-play-state:paused]"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </motion.button>
            <button
              type="button"
              onClick={() => setShowBeenHere(true)}
              className="text-muted text-sm hover:text-foreground hover:underline underline-offset-4 ml-5 mr-auto cursor-pointer bg-transparent border-0 p-0 font-sans"
            >
              Already been here?
            </button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-5 sm:bottom-7 flex flex-col items-center text-muted cursor-default">
        <span className="text-sm tracking-wider uppercase">Scroll</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5 animate-nudge-y"
          aria-hidden
        >
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </div>

      {showBeenHere && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-6">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-6 flex flex-col gap-4 font-sans">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-extrabold tracking-tight">
                Already been here?
              </h2>
              <p className="text-sm text-muted">
                Pick what fits so we can get you back into chat.
              </p>
            </div>
            <button
              type="button"
              onClick={recoverAccount}
              className="rounded-xl bg-accent text-surface px-4 py-3 text-base font-bold hover:bg-accent-hover cursor-pointer"
            >
              I had an account here
            </button>
            <button
              type="button"
              onClick={() => router.push("/chat?c=returning")}
              className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-base font-bold hover:bg-surface cursor-pointer"
            >
              I didnt have an account here
            </button>
            <button
              type="button"
              onClick={() => setShowBeenHere(false)}
              className="text-sm text-muted hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
