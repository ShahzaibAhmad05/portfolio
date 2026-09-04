"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Reveal from "@/components/Reveal";
import { CONTACT } from "@/lib/content";
import { trackButtonClick } from "@/lib/stats";

const FIELD =
  "w-full rounded-xl border border-white/[0.11] bg-background px-4 py-[15px] text-[15px] font-light text-foreground outline-none transition-colors duration-200 placeholder:text-foreground-faint focus:border-accent";

const LABEL =
  "text-[11px] font-medium tracking-[0.14em] text-foreground-dim uppercase";

export default function ContactSection() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const idea = String(form.get("idea") ?? "");
    const from = String(form.get("contact") ?? "");
    const body = `${idea}\n\nReach me at: ${from}`;

    trackButtonClick("send_email");
    setSent(true);
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      "An idea for you",
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section
      id="contact"
      className="scroll-mt-[68px] border-t border-hairline bg-background-light"
    >
      <div className="mx-auto grid w-full max-w-[1208px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-start gap-[clamp(40px,5vw,72px)] px-6 py-[clamp(80px,9vw,128px)]">
        <Reveal from="left" className="flex min-w-0 flex-col gap-[22px]">
          <span className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">
            Contact
          </span>
          <h2 className="font-display text-[clamp(38px,4.8vw,64px)] leading-[0.98] tracking-[0.01em]">
            READY TO BUILD YOUR NEXT REVENUE?
          </h2>
          <p className="max-w-[40ch] text-base font-light leading-[1.7] text-foreground-dim text-pretty">
            Tell me what you are trying to ship. I will reply with scope, a
            timeline and a number, usually within a day.
          </p>

          <div className="flex flex-col gap-3.5 pt-2">
            <Link
              href={CONTACT.phoneHref}
              onClick={() => trackButtonClick("whatsapp")}
              className="flex items-center gap-3 text-[15px] transition-colors duration-200 hover:text-accent"
            >
              <span
                aria-hidden
                className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-white/[0.14] text-[13px] text-accent"
              >
                ☎
              </span>
              {CONTACT.phone}
            </Link>
            <Link
              href={`mailto:${CONTACT.email}`}
              onClick={() => trackButtonClick("mail")}
              className="flex items-center gap-3 text-[15px] transition-colors duration-200 hover:text-accent"
            >
              <span
                aria-hidden
                className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-white/[0.14] text-[13px] text-accent"
              >
                ✉
              </span>
              {CONTACT.email}
            </Link>
          </div>
        </Reveal>

        <Reveal
          as="form"
          from="right"
          delay={120}
          onSubmit={handleSubmit}
          className="flex min-w-0 flex-col gap-[22px] rounded-[20px] border border-white/[0.08] bg-card p-[clamp(26px,3vw,38px)]"
        >
          <label className="flex flex-col gap-[9px]">
            <span className={LABEL}>Your idea</span>
            <textarea
              name="idea"
              rows={5}
              required
              placeholder="Type freely. I would treat this as highly confidential."
              className={`${FIELD} resize-y leading-[1.6]`}
            />
          </label>
          <label className="flex flex-col gap-[9px]">
            <span className={LABEL}>Any contact info</span>
            <input
              name="contact"
              type="text"
              required
              placeholder="So I can respond back to you."
              className={FIELD}
            />
          </label>
          <button
            type="submit"
            className="cursor-pointer self-start rounded-full bg-accent px-[30px] py-[15px] text-[15px] font-medium text-background transition-colors duration-200 hover:bg-accent-hover"
          >
            {sent ? "Sent, I'll reply shortly" : "Send an email"}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
