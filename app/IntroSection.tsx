"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Icon from "@/components/Icon";
import { fromAbove, fromLeft, fromRight, DURATION, EASE } from "@/lib/motion";
import { trackButtonClick } from "@/lib/stats";

const floatIcons = [
  { src: "/react.svg", top: "4%", left: "3%", opacity: 0.12 },
  { src: "/code.svg", top: "8%", left: "12%", opacity: 0.18 },
  { src: "/database.svg", top: "3%", left: "25%", opacity: 0.15 },
  { src: "/hash.svg", top: "4%", left: "37%", opacity: 0.2 },
  { src: "/server.svg", top: "9%", left: "50%", opacity: 0.2 },
  { src: "/layers.svg", top: "2%", left: "63%", opacity: 0.14 },
  { src: "/gitBranch.svg", top: "3%", left: "78%", opacity: 0.12 },
  { src: "/cloud.svg", top: "11%", left: "92%", opacity: 0.16 },
];

const socials = [
  { src: "/icons/discord.svg", label: "Discord", code: "discord" },
  { src: "/icons/whatsapp.svg", label: "WhatsApp", code: "whatsapp" },
  { src: "/icons/mail.svg", label: "Email", code: "mail" },
  { src: "/icons/linkedin.svg", label: "LinkedIn", code: "linkedin" },
];

export default function IntroSection() {
  const { scrollY } = useScroll();
  const scrollCtaOpacity = useTransform(scrollY, [0, 120], [1, 0]);
  const scrollCtaY = useTransform(scrollY, [0, 120], [0, 16]);

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-background-light">
      {floatIcons.map((icon) => (
        <div
          key={icon.src + icon.left}
          aria-hidden
          className="pointer-events-none absolute hidden size-9 bg-foreground md:block"
          style={{
            top: icon.top,
            left: icon.left,
            opacity: icon.opacity,
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
      ))}

      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-[13%] h-[42%] w-[58%] max-w-[832px] rounded-full bg-[radial-gradient(circle_at_center,rgba(185,185,185,0.28)_0%,rgba(185,185,185,0)_70%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-6 pb-24 pt-16 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-20 lg:pb-28 lg:pt-20">
        <div className="flex max-w-xl flex-col lg:max-w-[620px]">
          <motion.div {...fromAbove} className="relative">
            <p className="font-display text-[clamp(2rem,5vw,3.7rem)] leading-none text-foreground">
              This is
            </p>
            <h1 className="font-display text-[clamp(4.5rem,18vw,12.8rem)] leading-[0.85] text-accent">
              Shahzaib
            </h1>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                trackButtonClick("github");
              }}
              aria-label="GitHub"
              className="absolute right-0 top-[18%] hidden opacity-90 transition-opacity hover:opacity-100 sm:block lg:right-[-0.5rem] lg:top-[22%]"
            >
              <Icon src="/icons/github.svg" size={40} />
            </Link>
          </motion.div>

          <motion.p
            {...fromLeft}
            transition={{ duration: DURATION, ease: EASE, delay: 0.12 }}
            className="mt-4 max-w-[34rem] text-[clamp(1.15rem,2.4vw,2.7rem)] font-black leading-tight text-foreground"
          >
            Helping Founders Build{" "}
            <span className="text-accent">High-Quality</span> Software Free of
            AI slop
          </motion.p>

          <motion.div
            {...fromLeft}
            transition={{ duration: DURATION, ease: EASE, delay: 0.22 }}
            className="mt-8 flex flex-col gap-4 sm:mt-10"
          >
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <Link
                  key={s.code}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    trackButtonClick(s.code);
                  }}
                  aria-label={s.label}
                  className="opacity-90 transition-opacity hover:opacity-100"
                >
                  <Icon src={s.src} size={20} />
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  trackButtonClick("discuss");
                }}
                className="inline-flex w-fit items-center justify-center rounded-[21px] border border-[#494545] bg-accent px-6 py-3.5 text-base font-medium text-black transition-colors hover:bg-accent-hover sm:text-lg"
              >
                Discuss An Idea
              </Link>
              <div className="flex flex-col">
                <span className="text-sm text-foreground sm:text-base">
                  Contact me on WhatsApp
                </span>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    trackButtonClick("whatsapp");
                  }}
                  className="font-display text-[clamp(2rem,6vw,4.8rem)] leading-none tracking-tight text-foreground"
                >
                  +923184299873
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...fromRight}
          transition={{ duration: DURATION, ease: EASE, delay: 0.15 }}
          className="relative mt-10 hidden shrink-0 lg:mt-0 lg:block"
        >
          <Image
            src="/pfp.png"
            alt="Shahzaib"
            width={602}
            height={702}
            priority
            className="relative z-10 w-[min(38vw,602px)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-4%] left-[-35%] z-20 h-[45%] w-[160%] bg-[radial-gradient(ellipse_at_center,var(--background-light)_20%,transparent_70%)]"
          />
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: scrollCtaOpacity, y: scrollCtaY }}
        className="pointer-events-none absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-foreground"
      >
        <span className="text-sm tracking-[0.12em] uppercase sm:text-base">
          SCROLL
        </span>
        <Icon src="/icons/arrow-down.svg" size={24} className="animate-nudge-y" />
      </motion.div>
    </section>
  );
}
