"use client";

import { useEffect } from "react";
import IntroSection from "./IntroSection";
import ProofingSection from "./ProofingSection";

const PUSH_THRESHOLD = 180;
const DAMPEN = 0.28;
const SNAPINESS = 0.15;

export default function Home() {
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

    function shouldTakeOver() {
      return window.scrollY < window.innerHeight - 1;
    }

    function handleDelta(deltaY: number) {
      if (animatingFull) {
        const movingDown = target > current;
        if ((movingDown && deltaY < 0) || (!movingDown && deltaY > 0)) {
          target = movingDown ? 0 : window.innerHeight;
        }
        return;
      }
      current = window.scrollY;

      acc += deltaY;
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
        startTick();
        return;
      }

      target = clamp(target + deltaY * DAMPEN);
      startTick();
    }

    function onWheel(e: WheelEvent) {
      if (!shouldTakeOver()) return;
      e.preventDefault();
      handleDelta(e.deltaY);
    }

    let touchY = 0;

    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (!shouldTakeOver()) return;
      e.preventDefault();
      const newY = e.touches[0].clientY;
      const deltaY = touchY - newY;
      touchY = newY;
      handleDelta(deltaY * 2.5);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.clearTimeout(accTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <IntroSection />
      <ProofingSection />
    </div>
  );
}
