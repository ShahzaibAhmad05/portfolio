"use client";

import gsap from "gsap";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import Wordmark from "@/components/Wordmark";

/*
 * The entrance: a full-screen accent cover with the wordmark on it, whose bottom
 * edge bulges into a curve and then sweeps up off the top, revealing the page.
 * The cover is clipped by an SVG path in 0..1 box units; each shape below is that
 * path's nine numbers: the left edge's y, then two smooth curve segments.
 */
type Shape = number[];
const COVERED: Shape = [1.4, 0.084, 1.201, 0.286, 1.2, 0.652, 1.39, 1.001, 1.393]; // edge below the screen
const CURVED: Shape = [1, 0.06, 0.77, 0.27, 0.77, 0.59, 1, 1, 1]; // edge lifts into a wave
const CURVED_MOBILE: Shape = [1, 0.07, 0.88, 0.28, 0.89, 0.59, 1, 1, 1];
const GONE: Shape = [0, 0, 0, 0.289, 0, 1, 0, 1, 0]; // edge flat against the top

const path = (s: Shape) => `M0 ${s[0]} S ${s[1]} ${s[2]} ${s[3]} ${s[4]} S ${s[5]} ${s[6]} ${s[7]} ${s[8]} L 1 0 H 0 Z`;

const HOLD_S = 0.5; // the wordmark sits still on the cover, at least this long
const WAIT_CAP_S = 2; // ...and at most this long, however slow the network
const RISE_S = 1;
const LEAVE_S = 0.8;

/** Settles once what the cover is hiding is ready to be seen: fonts in, images decoded, the showreel on its first frame. Never later than the cap. */
function pageReady() {
  const images = Array.from(document.images)
    .filter((img) => img.loading !== "lazy")
    .map((img) => img.decode().catch(() => {}));
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video[autoplay]")).map(
    (video) =>
      new Promise<void>((resolve) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA || video.error) return resolve();
        video.addEventListener("loadeddata", () => resolve(), { once: true });
        video.addEventListener("error", () => resolve(), { once: true });
      }),
  );
  const cap = new Promise<void>((resolve) => setTimeout(resolve, WAIT_CAP_S * 1000));
  return Promise.race([Promise.all([document.fonts.ready, ...images, ...videos]), cap]);
}

export default function Preloader() {
  const [done, setDone] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  // the page holds still until the cover is gone
  useEffect(() => {
    if (done) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis, done]);

  useEffect(() => {
    const cover = coverRef.current;
    const el = pathRef.current;
    const mark = markRef.current;
    if (!cover || !el || !mark) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = setTimeout(() => setDone(true), HOLD_S * 1000);
      return () => clearTimeout(id);
    }
    const shape = [...COVERED];
    const draw = () => el.setAttribute("d", path(shape));
    const curved = matchMedia("(max-width: 768px)").matches ? CURVED_MOBILE : CURVED;
    const tl = gsap.timeline({ paused: true, onComplete: () => setDone(true) });
    // globals.css keeps the scrollbar away until this flag is set: it returns once, while the page is still fully covered
    tl.call(() => cover.setAttribute("data-lifting", ""), [], 0);
    tl.to(mark, { yPercent: -20, duration: RISE_S, ease: "expo.out" });
    tl.to(shape, { endArray: curved, duration: RISE_S, ease: "expo.out", onUpdate: draw }, "<");
    tl.to(shape, { endArray: GONE, duration: LEAVE_S, ease: "power4.inOut", onUpdate: draw });
    tl.to(mark, { yPercent: -100, duration: LEAVE_S, ease: "power4.inOut" }, "<");
    // lift after the hold, or as soon after it as the page underneath is ready
    let cancelled = false;
    const hold = new Promise<void>((resolve) => setTimeout(resolve, HOLD_S * 1000));
    Promise.all([hold, pageReady()]).then(() => {
      if (!cancelled) tl.play();
    });
    return () => {
      cancelled = true;
      tl.kill();
      cover.removeAttribute("data-lifting");
      gsap.set(mark, { yPercent: 0 });
      el.setAttribute("d", path(COVERED));
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={coverRef}
      aria-hidden
      // w-screen, not inset-0: the cover keeps its width when the scrollbar returns, so the wordmark does not jump
      className="preloader fixed inset-y-0 left-0 z-[9999] w-screen flex items-center justify-center overflow-hidden bg-accent [clip-path:url(#preloader-clip)]"
    >
      <svg width="0" height="0" className="absolute top-0 left-0">
        <clipPath id="preloader-clip" clipPathUnits="objectBoundingBox">
          <path ref={pathRef} d={path(COVERED)} />
        </clipPath>
      </svg>
      <span ref={markRef} className="block w-[clamp(280px,72vw,1100px)] text-foreground">
        <Wordmark mark="phrase" className="h-auto w-full" strokeWidth={2.4} />
      </span>
      {/* nothing would ever lift the cover without scripts */}
      <noscript>
        <style>{".preloader{display:none}html{overflow:visible!important}"}</style>
      </noscript>
    </div>
  );
}
