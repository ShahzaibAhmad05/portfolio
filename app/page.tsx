"use client";

import { useEffect, useState } from "react";
import IntroSection from "./IntroSection";
import ProofingSection from "./ProofingSection";

const PUSH_THRESHOLD = 180;
const DAMPEN = 0.28;
const SNAPINESS = 0.15;

export default function Home() {
  const [proofReady, setProofReady] = useState(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    let target = 0;
    let current = 0;
    let acc = 0;
    let animatingFull = false;
    let raf = 0;
    let accTimer = 0;

    function maxScroll() {
      return document.documentElement.scrollHeight - window.innerHeight;
    }

    function clamp(n: number) {
      return Math.min(Math.max(n, 0), maxScroll());
    }

    function tick() {
      current += (target - current) * SNAPINESS;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        animatingFull = false;
      }
      window.scrollTo(0, current);
      raf = current !== target ? requestAnimationFrame(tick) : 0;
    }

    function startTick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onWheel(e: WheelEvent) {
      if (window.scrollY >= window.innerHeight - 1) return;

      e.preventDefault();
      if (animatingFull) {
        const movingDown = target > current;
        if ((movingDown && e.deltaY < 0) || (!movingDown && e.deltaY > 0)) {
          target = movingDown ? 0 : window.innerHeight;
        }
        return;
      }
      current = window.scrollY;

      acc += e.deltaY;
      window.clearTimeout(accTimer);
      accTimer = window.setTimeout(() => {
        acc = 0;
        if (animatingFull) return;
        target = clamp(Math.round(current / window.innerHeight) * window.innerHeight);
        startTick();
      }, 220);

      if (Math.abs(acc) >= PUSH_THRESHOLD) {
        const dir = acc > 0 ? 1 : -1;
        acc = 0;
        animatingFull = true;
        const index = Math.round(current / window.innerHeight);
        const next = index + dir;
        target = clamp(next * window.innerHeight);
        if (next === 1) setProofReady(true);
        startTick();
        return;
      }

      target = clamp(target + e.deltaY * DAMPEN);
      startTick();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.clearTimeout(accTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <IntroSection />
      <ProofingSection ready={proofReady} />
    </div>
  );
}
