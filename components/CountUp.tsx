"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  suffix?: string;
  delay?: number;
  className?: string;
};

/** Counts from zero the first time the number scrolls into view. */
export default function CountUp({ to, suffix = "", delay = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const label = useTransform(count, (value) => Math.round(value) + suffix);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, to, {
      duration: 0.9,
      delay: delay / 1000,
      ease: [0.33, 1, 0.68, 1],
    });
    return () => controls.stop();
  }, [inView, count, to, delay]);

  return (
    <motion.span ref={ref} className={className}>
      {label}
    </motion.span>
  );
}
