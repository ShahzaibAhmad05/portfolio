"use client";

import Link from "next/link";
import { trackButtonClick } from "@/lib/stats";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#services", label: "Services" },
  { href: "#approach", label: "Approach" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-[rgba(28,28,27,0.82)] backdrop-blur-[14px]">
      <nav className="mx-auto flex h-[68px] w-full max-w-[1208px] items-center justify-between gap-6 px-6">
        <Link
          href="#top"
          className="font-display text-[26px] leading-none tracking-[0.02em] text-foreground"
        >
          SHAHZAIB<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-6 sm:gap-[34px]">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-sm text-foreground-dim transition-colors duration-200 hover:text-foreground sm:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={() => trackButtonClick("discuss")}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition-colors duration-200 hover:bg-accent-hover"
          >
            Discuss an idea
          </Link>
        </div>
      </nav>
    </header>
  );
}
