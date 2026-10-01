"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CONTACT } from "@/lib/content";

const COLUMNS = [
  {
    label: "Site",
    links: [
      { label: "Work", href: "#work" },
      { label: "Process", href: "#craft" },
      { label: "Testimonials", href: "#testimonials" },
    ],
  },
  {
    label: "Get in touch",
    links: [
      { label: "Contact", href: "#contact" },
      { label: "Email", href: `mailto:${CONTACT.email}` },
      { label: "WhatsApp", href: CONTACT.whatsapp },
    ],
  },
  {
    label: "Elsewhere",
    links: [
      { label: "GitHub", href: CONTACT.github },
      { label: "LinkedIn", href: CONTACT.linkedin },
      { label: "PyPI", href: CONTACT.pypi },
    ],
  },
];

const WORDMARK_SPAN = 0.75; // share of the container width the wordmark fills

/** A wordmark sized to a fixed share of its container's width. */
function Wordmark() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = "100px";
      el.style.fontSize = (100 * WORDMARK_SPAN * box.clientWidth) / el.scrollWidth + "px";
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="overflow-hidden">
      <p ref={ref} aria-hidden className="m-0 mb-[22px] w-max text-[23vw] leading-[0.8] font-medium tracking-[-0.035em] whitespace-nowrap">
        Shahzaib
      </p>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer data-section="footer" className="overflow-hidden bg-ink px-[clamp(16px,2.5vw,36px)] pt-[60px] text-background">
      <div className="grid grid-cols-2 gap-y-10 md:grid-cols-[242px_242px_307px_1fr]">
        {COLUMNS.map((col) => (
          <nav key={col.label} aria-label={col.label} className="flex flex-col gap-4">
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="text-xl leading-[30px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
        <span className="text-lg leading-[27px]">© Copyright Shahzaib {new Date().getFullYear()}</span>
      </div>
      <div className="mt-[clamp(96px,16vw,230px)]">
        <Wordmark />
      </div>
    </footer>
  );
}
