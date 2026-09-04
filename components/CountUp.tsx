"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";

type CountUpProps = {
  to: number;
  suffix?: string;
  delay?: number;
  className?: string;
};

/** Shows the real figure, then counts up to it the first time it scrolls into view. */
export default function CountUp({ to, suffix = "", delay = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const count = useMotionValue(to);
  const label = useTransform(count, (value: number) => Math.round(value) + suffix);

  useEffect(() => {
    if (!inView || reduced) return;
    count.set(0);
    const controls = animate(count, to, {
      duration: 0.9,
      delay: delay / 1000,
      ease: [0.33, 1, 0.68, 1],
    });
    return () => controls.stop();
  }, [inView, reduced, count, to, delay]);

  return (
    <motion.span ref={ref} className={className}>
      {label}
    </motion.span>
  );
}
