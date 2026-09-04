"use client";

import { motion } from "framer-motion";
import type { ElementType, FormEventHandler, ReactNode } from "react";
import { DURATION, EASE, OFFSET, VIEWPORT, type Direction } from "@/lib/motion";

const TAGS = {
  div: motion.div,
  article: motion.article,
  figure: motion.figure,
  form: motion.form,
  p: motion.p,
} as const;

type RevealProps = {
  as?: keyof typeof TAGS;
  from?: Direction;
  /** Milliseconds, to keep the design's stagger values readable. */
  delay?: number;
  /** Hero content animates on mount instead of waiting to be scrolled into view. */
  immediate?: boolean;
  className?: string;
  children?: ReactNode;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

const SETTLED = { opacity: 1, x: 0, y: 0 };

/** Fade + slide a block into place, once, the way the design does it. */
export default function Reveal({
  as = "div",
  from = "up",
  delay = 0,
  immediate = false,
  ...rest
}: RevealProps) {
  // the union of motion tags confuses the prop types, so widen it once here
  const Tag = TAGS[as] as ElementType;

  return (
    <Tag
      initial={{ opacity: 0, ...OFFSET[from] }}
      {...(immediate
        ? { animate: SETTLED }
        : { whileInView: SETTLED, viewport: VIEWPORT })}
      transition={{
        duration: DURATION,
        ease: EASE,
        delay: (immediate ? 120 + delay : delay) / 1000,
      }}
      {...rest}
    />
  );
}
