"use client";

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { CONTACT } from "@/lib/content";

export default function HeroSection() {
  return (
    <section
      id="top"
      data-section="hero"
      className="flex min-h-[calc(100svh-68px)] scroll-mt-[68px] items-center border-b border-hairline bg-background-light"
    >
      <div className="mx-auto grid w-full max-w-[1208px] grid-cols-[repeat(auto-fit,minmax(340px,1fr))] items-center gap-[clamp(40px,5vw,72px)] px-6 pt-[clamp(64px,7vw,104px)] pb-[clamp(56px,6vw,88px)]">
        <div className="flex min-w-0 flex-col items-start gap-7">
          <Reveal from="down" immediate className="flex flex-col gap-1">
            <span className="font-display text-[clamp(20px,2vw,24px)] leading-none tracking-[0.14em] text-foreground-dim">
              THIS IS
            </span>
            <h1 className="font-display text-[clamp(72px,9.5vw,132px)] leading-[0.88] tracking-[0.005em] text-accent">
              SHAHZAIB
            </h1>
          </Reveal>

          <Reveal
            as="p"
            from="left"
            immediate
            delay={90}
            className="max-w-[19ch] text-[clamp(20px,2.1vw,27px)] font-light leading-[1.35] text-pretty"
          >
            Helping founders build high-quality software, free of AI slop.
          </Reveal>

          <Reveal
            as="p"
            from="left"
            immediate
            delay={150}
            className="max-w-[44ch] text-base font-light leading-[1.65] text-foreground-dim text-pretty"
          >
            Software engineer, 3+ years. Desktop apps, search systems and computer
            vision, built by hand, shipped to clients in six countries.
          </Reveal>

          <Reveal
            from="left"
            immediate
            delay={210}
            className="flex flex-wrap items-center gap-3.5 pt-1"
          >
            <Link
              href="#contact"
              data-track="hero-cta-discuss"
              className="rounded-full bg-accent px-7 py-[15px] text-[15px] font-medium text-background transition-colors duration-200 hover:bg-accent-hover"
            >
              Discuss an idea
            </Link>
            <Link
              href="#work"
              data-track="hero-cta-work"
              className="rounded-full border border-white/[0.18] px-[26px] py-3.5 text-[15px] transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              See selected work
            </Link>
          </Reveal>

          <Reveal
            from="left"
            immediate
            delay={270}
            className="mt-1.5 w-full border-t border-white/[0.08] pt-[18px] text-[13px] text-foreground-dim"
          >
            <span className="text-foreground">{CONTACT.phone}</span>
            <span className="px-2.5 text-foreground-faint">/</span>
            <Link
              href={`mailto:${CONTACT.email}`}
              data-track="hero-email"
              className="text-accent transition-colors duration-200 hover:text-accent-hover"
            >
              {CONTACT.email}
            </Link>
            <span className="px-2.5 text-foreground-faint">·</span>
            <span className="text-accent">Available for new work</span>
          </Reveal>
        </div>

        <Reveal
          from="right"
          immediate
          delay={60}
          className="flex min-w-0 justify-center"
        >
          <div className="relative aspect-[5/6] w-full max-w-[420px] overflow-hidden rounded-[20px] border border-white/[0.09] bg-background">
            <Image
              src="/pfp.png"
              alt="Shahzaib Ahmad Shahid"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 420px"
              className="object-cover object-bottom contrast-[1.04] grayscale-[0.35]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(28,28,27,0.92)_0%,rgba(28,28,27,0.18)_42%,rgba(28,28,27,0)_68%)]"
            />
            <div className="absolute right-[22px] bottom-5 left-[22px] flex flex-col gap-[3px]">
              <span className="text-[15px] font-medium">Shahzaib Ahmad Shahid</span>
              <span className="text-xs font-light text-foreground-dim">
                Software Engineer · Islamabad, PK
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
