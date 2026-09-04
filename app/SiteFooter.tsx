"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import { CONTACT } from "@/lib/content";
import { trackButtonClick } from "@/lib/stats";

const LINKS = [
  { label: "GitHub", href: CONTACT.github, code: "github" },
  { label: "LinkedIn", href: "#", code: "linkedin" },
  { label: "WhatsApp", href: CONTACT.whatsapp, code: "whatsapp" },
  { label: "Email", href: `mailto:${CONTACT.email}`, code: "mail" },
];

export default function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-hairline bg-background">
      <Reveal className="mx-auto flex w-full max-w-[1208px] flex-wrap items-start justify-between gap-8 px-6 pt-[clamp(56px,6vw,88px)]">
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-medium">Shahzaib Ahmad Shahid</span>
          <span className="text-[13px] font-light text-foreground-muted">
            Software Engineer · Islamabad, Pakistan
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-[26px]">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => trackButtonClick(link.code)}
              className="text-sm text-foreground-dim transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal
        delay={90}
        className="mx-auto w-full max-w-[1208px] px-6 pt-[clamp(32px,4vw,56px)]"
      >
        <p className="overflow-hidden font-display text-[clamp(76px,15.5vw,232px)] leading-[0.8] tracking-[0.005em] whitespace-nowrap text-accent">
          SHAHZAIB<span className="text-foreground">.</span>
        </p>
      </Reveal>

      <Reveal
        delay={180}
        className="mx-auto mt-[clamp(24px,3vw,40px)] w-full max-w-[1208px] border-t border-hairline px-6 pt-[26px] pb-[34px] text-xs font-light text-foreground-faint"
      >
        © {new Date().getFullYear()} Shahzaib Ahmad Shahid. All rights reserved.
      </Reveal>
    </footer>
  );
}
