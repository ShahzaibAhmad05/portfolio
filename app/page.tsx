"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Home() {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.3 });

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();

    const magnetDistance = 0.07;
    x.set((e.clientX - (left + width / 2)) * magnetDistance);
    y.set((e.clientY - (top + height / 2)) * magnetDistance);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="flex flex-col">
      <section className="relative flex flex-col h-svh items-center justify-center">
        <div className="flex flex-row items-center justify-center mx-28 gap-6">
          <Image
            src="/pfp.png"
            alt="Profile photo"
            width={500}
            height={500}
            priority
            className="hidden md:block shrink-0 md:h-100 md:w-100 grayscale mb-18"
          />
          <div className="flex flex-col gap-16">
            <h1 className="text-4xl sm:text-7xl font-semibold text-foreground tracking-tighter flex flex-col">
              <span className="z-1">Building Software</span>
              <span className="sm:text-8xl text-accent uppercase font-extrabold -mt-5">
                3X Faster
              </span>
              <span className="text-4xl tracking-tight -mt-3">
                than your AI Does
              </span>
            </h1>
            <div className="flex flex-col items-center gap-1">
              <motion.button
                ref={ref}
                style={{ x: springX, y: springY }}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                className="group bg-accent text-surface py-4 rounded-3xl text-4xl font-sans font-extrabold flex flex-row items-center justify-center gap-2 hover:bg-accent-hover w-full"
              >
                Click to Begin
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
              <Link
                href="#"
                className="text-muted text-sm hover:text-foreground hover:underline underline-offset-4 ml-5 mr-auto"
              >
                Already been here?
              </Link>
            </div>
          </div>
        </div>
        <a
          href="#next"
          className="absolute bottom-5 flex flex-col items-center gap-1 text-muted hover:text-foreground transition-colors"
          aria-label="Scroll down"
        >
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
        </a>
      </section>
    </div>
  );
}
