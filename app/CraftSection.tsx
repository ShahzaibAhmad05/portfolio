"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { CRAFT_CARDS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

// Start pose per card as measured on fiasco.design: translate x%, y% (of the card) and
// rotate deg. Each card tweens to the exact negative while it crosses the viewport.
const POSES = [
  [-42.5061, 28.9675, 13.9338],
  [-48.7852, 22.3575, -15.9923],
  [46.577, -28.4558, 15.8227],
  [-36.3539, 27.1618, 11.5959],
  [-39.458, -22.3602, -17.4545],
];
const PILL_HIDE_AT = 0.55; // "Book a call" drops away at this share of the pin

/**
 * "Turning vibe-coded / to hand-crafted": the section pins while the card track
 * scrolls sideways 1:1 with the page, each card tilting and drifting through its pose.
 */
export default function CraftSection() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLHeadingElement>(null);
  const endRef = useRef<HTMLHeadingElement>(null);
  const pillRef = useRef<HTMLAnchorElement>(null);

  // Lenis drives the scroll; keep ScrollTrigger in step with it.
  useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    const pin = pinRef.current, track = trackRef.current;
    const start = startRef.current, end = endRef.current, pill = pillRef.current;
    if (!pin || !track || !start || !end || !pill) return;

    const ctx = gsap.context(() => {
      const travel = () => track.scrollWidth;
      const slide = gsap.to(track, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          pin: true,
          start: "top top",
          end: () => "+=" + travel(),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const cards = gsap.utils.toArray<HTMLElement>("[data-craft-card]", track);
      cards.forEach((card, i) => {
        const [x, y, r] = POSES[i % POSES.length];
        gsap.fromTo(
          card,
          { xPercent: x, yPercent: y, rotation: r },
          {
            xPercent: -x,
            yPercent: -y,
            rotation: -r,
            ease: "none",
            // left edge at 110% of the viewport -> right edge past -20%
            scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 110%", end: "right -20%", scrub: 1 },
          },
        );
      });

      // the opening title fades out as the first card's edge sweeps across it
      gsap.to(start, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: cards[0],
          containerAnimation: slide,
          start: () => `left ${innerWidth / 2 + start.offsetWidth / 2}px`,
          end: () => `left ${innerWidth / 2 - start.offsetWidth / 2}px`,
          scrub: true,
        },
      });
      // the closing title fades in as the last card leaves to the left
      gsap.fromTo(
        end,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: { trigger: cards[cards.length - 1], containerAnimation: slide, start: "left 21.6%", end: "left -1.3%", scrub: true },
        },
      );

      // "Book a call" slides up as the section arrives and away before the closing title
      gsap.set(pill, { y: 88 });
      ScrollTrigger.create({
        trigger: pin,
        start: "top 90%",
        end: () => `top+=${travel() * PILL_HIDE_AT} top`,
        invalidateOnRefresh: true,
        onToggle: (self) => gsap.to(pill, { y: self.isActive ? 0 : 88, duration: 0.3, ease: "power3.out", overwrite: true }),
      });
    }, pin);

    return () => ctx.revert();
  }, []);

  return (
    <section id="craft" data-section="craft" className="relative bg-background">
      <div ref={pinRef} className="relative flex h-screen flex-col justify-center overflow-hidden">
        <h2
          ref={startRef}
          className="absolute top-1/2 left-1/2 m-0 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(40px,calc(47px+33*((100vw-840px)/600)),96px)] leading-[1.2] font-normal whitespace-nowrap"
        >
          From prototype
        </h2>
        <h2
          ref={endRef}
          className="invisible absolute top-1/2 left-1/2 m-0 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(40px,calc(47px+33*((100vw-840px)/600)),96px)] leading-[1.2] font-normal whitespace-nowrap opacity-0"
        >
          To Art
        </h2>
        <div
          ref={trackRef}
          className="pointer-events-none flex w-max gap-[30px] pr-[20vw] pl-[120vw] will-change-transform"
        >
          {CRAFT_CARDS.map((card) => (
            <div
              key={card.src}
              data-craft-card
              className="relative aspect-square w-[clamp(300px,50vw,400px)] shrink-0 overflow-hidden rounded-lg bg-surface"
            >
              <Image src={card.src} alt={card.alt} fill sizes="400px" className="object-cover" />
            </div>
          ))}
        </div>
        <a
          ref={pillRef}
          href="#contact"
          className="absolute bottom-[30px] left-1/2 z-[4] flex -translate-x-1/2 items-center rounded-[40px] bg-foreground p-1 text-on-ink"
        >
          <Image src="/pfp.webp" alt="" width={44} height={44} unoptimized className="size-11 rounded-[40px] bg-accent object-cover" />
          <span className="mx-4 font-ui text-sm leading-none font-medium tracking-[-0.1px]">Book a call</span>
          <span className="flex size-11 items-center justify-center rounded-[40px] bg-background">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1E19" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" />
            </svg>
          </span>        </a>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-[clamp(20px,16.7vw,240px)] py-[clamp(96px,11vw,160px)] text-center">
        <h3 className="m-0 max-w-[900px] text-[clamp(24px,2.08vw,30px)] leading-[1.2] font-normal">
          I will build web products and mobile apps that aren&rsquo;t just Top-notch —<br />they belong to your users.
        </h3>
        <span className="font-serif text-[18.18px] leading-[25.452px] italic">I just happen to work that way</span>
      </div>
    </section>
  );
}
