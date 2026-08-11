"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

const options = {
  duration: 1.15,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.4,
  wheelMultiplier: 0.9,
  autoRaf: true,
};

export default function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
