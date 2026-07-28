"use client";

import { useEffect } from "react";
import IntroSection from "./IntroSection";
import ProofingSection from "./ProofingSection";

const PUSH_THRESHOLD = 60; // total delta needed to trigger a full section snap
const SENSITIVITY = 0.28; // how much a small scroll actually moves the target
const SNAPINESS = 0.25; // how fast current catches up to target each frame
const IDLE_DELAY = 100; // ms of no input before snapping to nearest section

export default function Home() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    let target = 0; // where we want the scroll to end up
    let current = 0; // animated scroll position
    let pushAmount = 0; // accumulated delta since the last idle reset
    let isSnapping = false; // true while animating a full section transition

    let animationFrame = 0;
    let idleTimer = 0;
    let lastTouchY = 0;

    const clamp = (n: number) =>
      Math.min(
        Math.max(n, 0),
        document.documentElement.scrollHeight - window.innerHeight,
      );
    const isInIntroSection = () => window.scrollY < window.innerHeight - 1;

    function animateScroll() {
      current += (target - current) * SNAPINESS;

      if (Math.abs(target - current) < 0.5) {
        current = target;
        isSnapping = false;
      }

      window.scrollTo(0, current);
      animationFrame =
        current !== target ? requestAnimationFrame(animateScroll) : 0;
    }

    function startAnimating() {
      if (!animationFrame)
        animationFrame = requestAnimationFrame(animateScroll);
    }

    function onScroll() {
      if (!isInIntroSection() || isSnapping || animationFrame) return;
      current = window.scrollY;
      const nearest = Math.round(current / window.innerHeight) * window.innerHeight;
      if (Math.abs(current - nearest) < 1) return; // already aligned
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(snapToNearestSectionOnIdle, IDLE_DELAY);
    }

    function snapToSection(direction: 1 | -1) {
      const currentIndex = Math.round(current / window.innerHeight);
      isSnapping = true;
      target = clamp((currentIndex + direction) * window.innerHeight);
      startAnimating();
    }

    function reverseSnapDirection(deltaY: number) {
      const movingDown = target > current;
      const isReversing =
        (movingDown && deltaY < 0) || (!movingDown && deltaY > 0);
      if (isReversing) target = movingDown ? 0 : window.innerHeight;
    }

    function snapToNearestSectionOnIdle() {
      pushAmount = 0;
      if (isSnapping) return;
      target = clamp(
        Math.round(current / window.innerHeight) * window.innerHeight,
      );
      startAnimating();
    }

    function handleScrollInput(deltaY: number) {
      if (isSnapping) {
        reverseSnapDirection(deltaY);
        return;
      }

      current = window.scrollY;
      pushAmount += deltaY;

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(snapToNearestSectionOnIdle, IDLE_DELAY);

      if (Math.abs(pushAmount) >= PUSH_THRESHOLD) {
        const direction = pushAmount > 0 ? 1 : -1;
        pushAmount = 0;
        snapToSection(direction);
        return;
      }

      target = clamp(target + deltaY * SENSITIVITY);
      startAnimating();
    }

    function onWheel(e: WheelEvent) {
      if (!isInIntroSection()) return;
      if (e.cancelable) e.preventDefault();
      handleScrollInput(e.deltaY);
    }

    function onTouchStart(e: TouchEvent) {
      if (!isInIntroSection()) return;
      lastTouchY = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (!isInIntroSection()) return;
      if (e.cancelable) e.preventDefault();

      const touchY = e.touches[0].clientY;
      const deltaY = (lastTouchY - touchY) * 2.5;
      lastTouchY = touchY;
      handleScrollInput(deltaY);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idleTimer);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <IntroSection />
      <ProofingSection />
    </div>
  );
}
