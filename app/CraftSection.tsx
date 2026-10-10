"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { CONTACT, CRAFT_CARDS } from "@/lib/content";

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
const PILL_HIDE_AT = 0.55; // "Schedule a meeting" drops away at this share of the pin
// Solid colour blocks that sit behind the "Art" of "To Art" and show only through its letters:
// [colour, where the block ends across the word, in %]. Hard edges, no blending.
const ART_BLOCKS: [string, number][] = [
  ["#B8320A", 28],
  ["#C99700", 50],
  ["#1E3FAE", 76],
  ["#0F6B3A", 100],
];
const ART_FILL = `linear-gradient(100deg, ${ART_BLOCKS.map(([c, end], i) => `${c} ${i ? ART_BLOCKS[i - 1][1] : 0}% ${end}%`).join(", ")})`;

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

      // "Schedule a meeting" slides up as the section arrives and away before the closing title
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
          From Prototype
        </h2>
        <h2
          ref={endRef}
          className="invisible absolute top-1/2 left-1/2 m-0 -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(40px,calc(47px+33*((100vw-840px)/600)),96px)] leading-[1.2] font-normal whitespace-nowrap opacity-0"
        >
          To{" "}
          <span className="text-transparent" style={{ backgroundImage: ART_FILL, backgroundClip: "text", WebkitBackgroundClip: "text" }}>
            Art
          </span>
        </h2>
        <div
          ref={trackRef}
          className="pointer-events-none flex w-max gap-[30px] pr-[20vw] pl-[120vw] will-change-transform"
        >
          {CRAFT_CARDS.map((card) => (
            <div
              key={card.src.src}
              data-craft-card
              className="relative aspect-square w-[clamp(300px,50vw,400px)] shrink-0 overflow-hidden bg-surface"
            >
              <Image src={card.src} alt={card.alt} fill sizes="400px" loading="eager" placeholder="blur" className="object-cover" />
            </div>
          ))}
        </div>
        <a
          ref={pillRef}
          href={CONTACT.calendly}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-[30px] left-1/2 z-[4] flex -translate-x-1/2 items-center bg-foreground p-1 text-on-ink"
        >
          <Image src="/pfp.webp" alt="" width={44} height={44} unoptimized className="size-11 bg-background object-cover" />
          <span className="mx-4 text-base leading-none font-medium tracking-wide whitespace-nowrap">Schedule a meeting</span>
          <span className="flex size-11 items-center justify-center bg-background">
            {/* the Calendly mark (Simple Icons), in the site ink */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#1D1E19" aria-hidden>
              <path d="M19.655 14.262c.281 0 .557.023.828.064 0 .005-.005.01-.005.014-.105.267-.234.534-.381.786l-1.219 2.106c-1.112 1.936-3.177 3.127-5.411 3.127h-2.432c-2.23 0-4.294-1.191-5.412-3.127l-1.218-2.106a6.251 6.251 0 0 1 0-6.252l1.218-2.106C6.736 4.832 8.8 3.641 11.035 3.641h2.432c2.23 0 4.294 1.191 5.411 3.127l1.219 2.106c.147.252.271.519.381.786 0 .004.005.009.005.014-.267.041-.543.064-.828.064-1.816 0-2.501-.607-3.291-1.306-.764-.676-1.711-1.517-3.44-1.517h-1.029c-1.251 0-2.387.455-3.2 1.278-.796.805-1.233 1.904-1.233 3.099v1.411c0 1.196.437 2.295 1.233 3.099.813.823 1.949 1.278 3.2 1.278h1.034c1.729 0 2.676-.841 3.439-1.517.791-.703 1.471-1.306 3.287-1.301Zm.005-3.237c.399 0 .794-.036 1.179-.11-.002-.004-.002-.01-.002-.014-.073-.414-.193-.823-.349-1.218.731-.12 1.407-.396 1.986-.819 0-.004-.005-.013-.005-.018-.331-1.085-.832-2.101-1.489-3.03-.649-.915-1.435-1.719-2.331-2.395-1.867-1.398-4.088-2.138-6.428-2.138-1.448 0-2.855.28-4.175.841-1.273.543-2.423 1.315-3.407 2.299S2.878 6.552 2.341 7.83c-.557 1.324-.842 2.726-.842 4.175 0 1.448.281 2.855.842 4.174.542 1.274 1.314 2.423 2.298 3.407s2.129 1.761 3.407 2.299c1.324.556 2.727.841 4.175.841 2.34 0 4.561-.74 6.428-2.137a10.815 10.815 0 0 0 2.331-2.396c.652-.929 1.158-1.949 1.489-3.03 0-.004.005-.014.005-.018-.579-.423-1.255-.699-1.986-.819.161-.395.276-.804.349-1.218.005-.009.005-.014.005-.023.869.166 1.692.506 2.404 1.035.685.505.552 1.075.446 1.416C22.184 20.437 17.619 24 12.221 24c-6.625 0-12-5.375-12-12s5.37-12 12-12c5.398 0 9.963 3.563 11.471 8.464.106.341.239.915-.446 1.421-.717.529-1.535.873-2.404 1.034.128.716.128 1.45 0 2.166-.387-.074-.782-.11-1.182-.11-4.184 0-3.968 2.823-6.736 2.823h-1.029c-1.899 0-3.15-1.357-3.15-3.095v-1.411c0-1.738 1.251-3.094 3.15-3.094h1.034c2.768 0 2.552 2.823 6.731 2.827Z" />
            </svg>
          </span>
        </a>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-[clamp(20px,16.7vw,240px)] py-[clamp(96px,11vw,160px)] text-center">
        <h3 className="m-0 max-w-[900px] text-[clamp(24px,2.08vw,30px)] leading-[1.3] font-normal">
          I build web products and mobile apps that aren&rsquo;t just top-notch —<br />they feel made for your users.
        </h3>
        <span className="font-serif text-[18.18px] leading-[25.452px] italic">I just happen to work that way</span>
      </div>
    </section>
  );
}
