"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Wordmark from "@/components/Wordmark";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#craft", label: "Process" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
];

// Past this scroll depth the header collapses into a small bar; one threshold, both ways.
const COLLAPSE_AT = 100;
// The small bar leaves once the paper layer's bottom edge (the end of Testimonials) is this
// close to the top of the viewport, just before Contact's yellow would show behind it.
const LEAVE_AT = 280;
const LEAVE = "450ms cubic-bezier(0.5, 0, 0.75, 0)"; // accelerates away
const RETURN = "600ms cubic-bezier(0.22, 1, 0.36, 1)"; // settles back in
const PANEL = "480ms cubic-bezier(0.28, 0, 0, 1)";
const SLIDE = "420ms cubic-bezier(0.36, 0.54, 0, 0.99)";
const LINK_DELAYS = [64, 75, 96, 117]; // ms, in link order
const CLOCK_DELAY = 138; // ms, after the last link
const LINKS_SHIFT = 255; // px the links slide left as they go
// the collapsed bar, in px
const MINI = { inset: 16, height: 48, radius: 0, padLeft: 14, padRight: 8, gap: 16, dotBox: 24, logoScale: 0.6 };

const pkTime = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

/** Local time in Pakistan, rendered after mount so server and client agree. */
function Clock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(pkTime());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 15000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <time aria-label="Local time in Pakistan" className="flex items-start gap-[1px] text-lg leading-[27px] tabular-nums">
      {time ?? "--:--"}
      <sup className="top-0 font-serif text-xs leading-[16.8px] tracking-[0.12px]">PK</sup>
    </time>
  );
}

export default function SiteHeader() {
  const [collapsed, setCollapsed] = useState(false);
  const [gone, setGone] = useState(false);
  const [logoW, setLogoW] = useState(180);
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const paperEnd = document.getElementById("testimonials");
    const onScroll = () => {
      setCollapsed(scrollY > COLLAPSE_AT);
      setGone(paperEnd ? paperEnd.getBoundingClientRect().bottom < LEAVE_AT : false);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // the mini bar is sized around the shrunken wordmark, whose width follows the fluid type
  useEffect(() => {
    const el = logoRef.current;
    if (!el) return;
    const measure = () => setLogoW(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const barW = MINI.padLeft + logoW * MINI.logoScale + MINI.gap + MINI.dotBox + MINI.padRight;

  return (
    // keeps its 88px in the flow so nothing below shifts; only its children take clicks
    <header
      className="pointer-events-none sticky top-0 z-50 h-[88px]"
      style={
        {
          "--pad": "clamp(16px,2.22vw,32px)",
          // past the paper layer the bar lifts out of the top of the screen, and drops back on the way up
          transform: `translateY(${gone ? -(MINI.inset + MINI.height + 12) : 0}px)`,
          opacity: gone ? 0 : 1,
          transition: `transform ${gone ? LEAVE : RETURN}, opacity ${gone ? LEAVE : RETURN}`,
        } as CSSProperties
      }
    >
      {/* the solid panel: a full-width strip at the top of the page, a small bar once scrolled */}
      <div
        aria-hidden
        className="absolute bg-background"
        style={{
          left: collapsed ? MINI.inset : 0,
          top: collapsed ? MINI.inset : 0,
          width: collapsed ? barW : "100%",
          height: collapsed ? MINI.height : 88,
          borderRadius: collapsed ? MINI.radius : 0,
          boxShadow: collapsed ? "0 0 0 1px var(--hairline)" : "0 0 0 1px transparent",
          transition: `all ${PANEL}`,
        }}
      />
      <span
        aria-hidden
        className="absolute flex items-center justify-center"
        style={{
          left: MINI.inset + barW - MINI.padRight - MINI.dotBox,
          top: MINI.inset + (MINI.height - MINI.dotBox) / 2,
          width: MINI.dotBox,
          height: MINI.dotBox,
          transform: `scale(${collapsed ? 1 : 0})`,
          transition: collapsed ? "transform 216ms cubic-bezier(0.38, 0.02, 0.41, 0.98) 256ms" : "transform 0ms",
        }}
      >
        <span className="size-1 rounded-full bg-foreground-faint" />
      </span>
      <nav className="relative flex h-full items-center justify-between gap-6 px-[var(--pad)]">
        <Link
          ref={logoRef}
          href="#top"
          tabIndex={gone ? -1 : undefined}
          aria-label="Shahzaib"
          className="pointer-events-auto flex h-[60px] origin-left items-center"
          style={{
            transform: collapsed
              ? `translate(calc(${MINI.inset + MINI.padLeft}px - var(--pad)), ${MINI.inset + MINI.height / 2 - 44}px) scale(${MINI.logoScale})`
              : "none",
            transition: `transform ${SLIDE}`,
          }}
        >
          {/* shrunk into the small bar the stroke gets too faint, so it takes a heavier one */}
          <Wordmark className="h-[clamp(36px,3.6vw,52px)] w-auto" strokeWidth={collapsed ? 4.5 : 3} />
        </Link>
        <div
          className={`flex items-center gap-[34px] ${collapsed ? "" : "pointer-events-auto"}`}
          aria-hidden={collapsed}
          style={{ transform: `translateX(${collapsed ? -LINKS_SHIFT : 0}px)`, transition: `transform ${SLIDE}` }}
        >
          {LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={collapsed ? -1 : undefined}
              className="hidden text-xl leading-[30px] font-normal text-foreground md:inline"
              // no fade: each link pops out (and back in) on its own delay
              style={{ opacity: collapsed ? 0 : 1, transition: `opacity 0ms linear ${LINK_DELAYS[i]}ms` }}
            >
              {link.label}
            </Link>
          ))}
          {/* the clock goes with the links, last in the sequence */}
          <span
            className="group relative cursor-default"
            style={{ opacity: collapsed ? 0 : 1, transition: `opacity 0ms linear ${CLOCK_DELAY}ms` }}
          >
            <Clock />
            <span
              role="tooltip"
              className="pointer-events-none absolute top-full right-0 mt-2 translate-y-1 bg-foreground px-2.5 py-1.5 text-xs leading-4 tracking-[0.2px] whitespace-nowrap text-background opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100"
            >
              Local Time for Shahzaib
            </span>
          </span>
        </div>
      </nav>
    </header>
  );
}
