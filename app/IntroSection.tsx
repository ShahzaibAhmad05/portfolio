"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function IntroSection() {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.3 });

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();

    const magnetDistance = 0.02;
    x.set((e.clientX - (left + width / 2)) * magnetDistance);
    y.set((e.clientY - (top + height / 2)) * magnetDistance);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
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
        <div className="flex flex-col gap-8 sm:gap-12">
          <h1 className="text-foreground flex flex-col">
            <div className="flex flex-col sm:flex-row sm:gap-3 z-1 tracking-tighter text-6xl sm:text-7xl font-semibold">
              <span className="leading-[0.9] sm:leading-none">Building</span>
              <span className="leading-[0.9] sm:leading-none">Software</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-3 text-[80px] leading-none sm:text-8xl text-accent uppercase font-extrabold -mt-1 sm:-mt-5 tracking-tighter">
              <span className="leading-[0.8] sm:leading-none">3X</span>
              <span className="leading-[0.8] sm:leading-none">Faster</span>
            </div>
            <div className="flex flex-row gap-1">
              <span className="text-5xl sm:text-5xl tracking-tight sm:-mt-5 z-1 font-semibold">
                than your AI
              </span>
              <Link
                href="#"
                className="text-muted text-sm font-normal mb-1 mt-auto sm:mb-0 sm:mt-1 hover:text-foreground hover:underline underline-offset-4"
              >
                See How?
              </Link>
            </div>
          </h1>
          <div className="flex flex-col items-center gap-1">
            <motion.button
              ref={ref}
              style={{ x: springX, y: springY }}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              className="group bg-accent text-surface py-8 sm:py-6 rounded-3xl text-[33px] sm:text-4xl font-sans font-extrabold flex flex-row items-center justify-center gap-2 hover:bg-accent-hover w-full"
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
      <div
        className="absolute bottom-5 flex flex-col items-center text-muted cursor-default"
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
      </div>
    </section>
  );
}
