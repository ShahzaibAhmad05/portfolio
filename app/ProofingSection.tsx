"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

const MotionLink = motion.create(Link);

const scatterIcons = [
  { src: "/react.svg", top: "8%", side: "left", offset: "4%", size: 40 },
  { src: "/code.svg", top: "21%", side: "left", offset: "9%", size: 34 },
  { src: "/terminal.svg", top: "34%", side: "left", offset: "5%", size: 32 },
  { src: "/database.svg", top: "47%", side: "left", offset: "11%", size: 36 },
  { src: "/server.svg", top: "60%", side: "left", offset: "4%", size: 34 },
  { src: "/gitBranch.svg", top: "73%", side: "left", offset: "10%", size: 30 },
  { src: "/cloud.svg", top: "86%", side: "left", offset: "6%", size: 34 },
  { src: "/globe.svg", top: "8%", side: "right", offset: "4%", size: 40 },
  { src: "/smartphone.svg", top: "21%", side: "right", offset: "9%", size: 30 },
  { src: "/shield.svg", top: "34%", side: "right", offset: "5%", size: 34 },
  { src: "/zap.svg", top: "47%", side: "right", offset: "11%", size: 32 },
  { src: "/layers.svg", top: "60%", side: "right", offset: "4%", size: 36 },
  { src: "/hash.svg", top: "73%", side: "right", offset: "10%", size: 30 },
  { src: "/cpu.svg", top: "86%", side: "right", offset: "6%", size: 34 },
];

const headlineLines = ["3+ Years Of", "Software", "Engineering"];

// icons reveal across the first slice of the pinned scroll, headline across the rest
const ICON_RANGE: [number, number] = [0, 0.45];
const HEADLINE_RANGE: [number, number] = [0.4, 1];

function rangeForIndex(
  index: number,
  count: number,
  [start, end]: [number, number],
): [number, number] {
  const step = (end - start) / count;
  return [start + index * step, start + (index + 1) * step];
}

function ScatterIcon({
  icon,
  progress,
  range,
}: {
  icon: (typeof scatterIcons)[number];
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);

  return (
    <motion.div
      className="absolute bg-foreground"
      style={{
        top: icon.top,
        [icon.side]: icon.offset,
        width: icon.size,
        height: icon.size,
        opacity,
        maskImage: `url(${icon.src})`,
        WebkitMaskImage: `url(${icon.src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

function RevealLine({
  line,
  progress,
  range,
}: {
  line: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const revealPercent = useTransform(progress, range, [0, 100]);
  const clipPath = useTransform(
    revealPercent,
    (v) => `inset(0 ${100 - v}% 0 0)`,
  );
  return (
    <span className="relative block" aria-hidden>
      <span className="text-surface-muted">{line}</span>
      <motion.span
        style={{ clipPath }}
        className="absolute inset-0 text-foreground"
      >
        {line}
      </motion.span>
    </span>
  );
}

const reviews = [
  {
    name: "Mamashka",
    pfp: "/pfps/mamashka.png",
    location: "United States",
    flag: "/flags/us.png",
    text: "Simply the best",
    textSize: "text-3xl sm:text-5xl",
    link: "https://www.fiverr.com/shahzaibahmad05/convert-your-python-projects-to-exe",
    from: "Fiverr Pro Client",
  },
  {
    name: "Forexgump",
    pfp: "/pfps/forexgump.png",
    location: "Switzerland",
    flag: "/flags/switzerland.png",
    text: "Excellent work. I would work with him again anytime.",
    textSize: "text-2xl sm:text-3xl",
    link: "https://www.fiverr.com/shahzaibahmad05/convert-your-python-projects-to-exe",
    from: "Verified Client From Fiverr",
  },
  {
    name: "MahmoudSuprime",
    pfp: "/pfps/mahmoud.png",
    location: "Morocco",
    flag: "/flags/morocco.png",
    text: "Nicely done, appreciate the effort",
    textSize: "text-2xl sm:text-3xl",
    link: "https://www.fiverr.com/shahzaibahmad05/convert-your-python-projects-to-exe",
    from: "Verified Client From Fiverr",
  },
];

export default function ProofingSection() {
  const pinRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="flex flex-col justify-between px-8 md:px-12 bg-surface">
      <div ref={pinRef} className="relative h-[250vh]">
        <div className="sticky top-0 flex items-center justify-center overflow-hidden h-svh">
          {scatterIcons.map((icon, idx) => (
            <ScatterIcon
              key={idx}
              icon={icon}
              progress={scrollYProgress}
              range={rangeForIndex(idx, scatterIcons.length, ICON_RANGE)}
            />
          ))}
          <h2
            aria-label="3+ Years Of Software Engineering"
            className="relative z-10 text-center uppercase leading-[0.85] font-display text-6xl sm:text-7xl md:text-8xl lg:text-[110px]"
          >
            {headlineLines.map((line, i) => (
              <RevealLine
                key={line}
                line={line}
                progress={scrollYProgress}
                range={rangeForIndex(i, headlineLines.length, HEADLINE_RANGE)}
              />
            ))}
          </h2>
        </div>
      </div>

      {/* reviews */}
      <div className="flex flex-col gap-8 py-10 md:py-16 items-center">
        {reviews.map((review, idx) => (
          <MotionLink
            key={review.name + idx}
            href={review.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="rounded-3xl bg-surface-muted px-6 py-6 md:px-10 md:py-8 w-full max-w-2xl border-2 border-transparent hover:border-border-harder"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={review.pfp}
                  alt={review.name}
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-semibold font-sans">{review.name}</span>
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    From {review.location}
                    <Image
                      src={review.flag}
                      alt={review.location}
                      width={16}
                      height={12}
                      className="inline-block h-3 w-4 object-cover"
                    />
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex size-6 items-center justify-center rounded-full bg-accent text-surface">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-3.5"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="text-sm text-right">{review.from}</span>
              </div>
            </div>
            <p
              className={
                "mt-10 mb-2 text-center font-extrabold font-sans leading-tight " +
                review.textSize
              }
            >
              &ldquo;{review.text}&rdquo;
            </p>
          </MotionLink>
        ))}
      </div>

      {/* check my profile thing */}
      <div className="py-32 flex flex-col items-center justify-center gap-18">
        <hr className="border border-border-harder w-full" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
          className="flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 text-lg sm:text-4xl lg:text-6xl font-bold font-sans tracking-tight text-foreground cursor-default text-center"
        >
          <p>Check My Profile On</p>
          <Link
            href="https://github.com/ShahzaibAhmad05"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            className="text-muted hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-12 md:size-16 lg:size-20"
              aria-hidden
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </Link>
          <p>&amp;</p>
          <Link
            href="https://www.linkedin.com/in/ShahzaibAhmad05"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            className="text-muted hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-12 md:size-16 lg:size-20"
              aria-hidden
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </Link>
        </motion.div>
        <hr className="border border-border-harder w-full" />
      </div>
    </section>
  );
}
