"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import CodeText from "@/components/CodeText";
import Reveal from "@/components/Reveal";
import type { CaseStudy } from "@/lib/content";

export default function CaseStudyCard({
  study,
  delay = 0,
}: {
  study: CaseStudy;
  delay?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Reveal
      as="article"
      delay={delay}
      className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-card transition-colors duration-200 hover:border-accent/40"
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
        <div className="flex min-w-0 flex-col gap-[18px] p-[clamp(28px,3vw,44px)]">
          <span className="text-[11px] font-medium tracking-[0.14em] text-accent uppercase">
            {study.eyebrow}
          </span>

          <h3 className="text-[clamp(26px,2.6vw,34px)] leading-[1.14] font-medium">
            {study.title}
            {study.titleSuffix ? (
              <>
                {" "}
                <span className="font-light text-foreground-faint">+</span>{" "}
                {study.titleSuffix}
              </>
            ) : null}
          </h3>

          <p className="text-base font-light leading-[1.65] text-foreground-body text-pretty">
            <CodeText text={study.summary} />
          </p>

          <div className="flex flex-wrap gap-2">
            {study.tech.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-surface px-3.5 py-[7px] text-xs text-foreground-body"
              >
                {tech}
              </span>
            ))}
          </div>

          <div
            className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-[460ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
            aria-hidden={!open}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mt-0.5 flex flex-col gap-3.5 border-t border-white/[0.08] pt-6">
                {study.detail.map((block) => (
                  <div key={block.label} className="flex flex-col gap-[5px]">
                    <span className="text-[11px] font-medium tracking-[0.14em] text-foreground-muted uppercase">
                      {block.label}
                    </span>
                    <p className="text-[15px] font-light leading-[1.65] text-foreground-body">
                      <CodeText text={block.body} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-[18px] pt-1.5">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 cursor-pointer rounded-full border border-accent/40 px-5 py-[11px] text-sm font-medium whitespace-nowrap text-accent transition-colors duration-200 hover:bg-accent/10"
            >
              {open ? "Hide detail" : "Read the detail"}
            </button>
            {study.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-sm whitespace-nowrap text-foreground-dim transition-colors duration-200 hover:text-foreground"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden border-l border-white/[0.06]">
          {study.image ? (
            <Image
              src={study.image}
              alt={`${study.title} preview`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="hatch flex h-full w-full items-center justify-center p-6">
              <span className="rounded-md bg-background-light px-3.5 py-2 text-center font-mono text-[11px] tracking-[0.08em] text-foreground-muted">
                {study.thumbnail}
              </span>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
