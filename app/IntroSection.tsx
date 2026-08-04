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
      {/* floating small navbar */}
      <div className="flex flex-row absolute top-5 left-5">
        <button className="flex flex-row items-center gap-2 border border-border-harder my-1 pl-6 pr-14 py-2 rounded-[20px] bg-deeper">
          <svg width="21" height="22" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.7607 11.477C26.9213 12.4167 27.0013 13.3687 27 14.3225C27 18.5818 25.5023 22.1832 22.8959 24.6209H22.8994C20.6201 26.761 17.487 28 13.772 28C10.1194 28 6.61647 26.5251 4.03372 23.8996C1.45097 21.2742 0 17.7134 0 14.0005C0 10.2876 1.45097 6.72672 4.03372 4.10129C6.61647 1.47587 10.1194 0.000923771 13.772 0.000923771C17.1908 -0.039777 20.4925 1.26584 22.9854 3.6443L19.0535 7.64117C17.6322 6.26392 15.7354 5.50973 13.772 5.54124C10.1792 5.54124 7.127 8.00516 6.03902 11.323C5.46215 13.0616 5.46215 14.9445 6.03902 16.6831H6.04418C7.13733 19.9958 10.1844 22.4597 13.7772 22.4597C15.6329 22.4597 17.227 21.9767 18.4631 21.1227H18.4579C19.1756 20.6394 19.7895 20.0133 20.2626 19.2821C20.7357 18.551 21.0582 17.7299 21.2106 16.8686H13.772V11.4788H26.7607V11.477Z" fill="white"/>
          </svg>
          <span className="text-lg sm:text-xl lg:text-xl">login</span>
        </button>
        <button className="px-4 rounded-2xl bg-accent text-background font-bold -ml-10 text-lg sm:text-xl lg:text-xl">
          Chat
        </button>
      </div>
      {/* header and picture */}
      <div className="flex flex-row items-end justify-center mb-[20svh]">
        <h1 className="text-foreground flex flex-col cursor-default leading-[0.78]">
          <span className="font-display text-[75px]">Building Software</span>
          <span className="font-display text-accent text-[165px]">3XBETTER</span>
          <span className="font-display text-[100px] -mt-1.5 z-1">
            than AI today
          </span>
        </h1>
        <div className="flex -ml-35">
          <Image
            src="/pfp.png"
            alt="Profile photo"
            width={500}
            height={500}
            priority
            className="hidden lg:block shrink-0 lg:w-120 grayscale mb-1.5"
          />
        </div>
      </div>
      {/* scroll CTA */}
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
    </section>
  );
}
