"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Reveal from "@/components/Reveal";
import { track } from "@/lib/analytics";
import { CONTACT } from "@/lib/content";

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

type SendState = "idle" | "pending" | "success" | "error";

const FIELD =
  "w-full rounded-xl border border-white/[0.11] bg-background px-4 py-[15px] text-[15px] font-light text-foreground outline-none transition-colors duration-200 placeholder:text-foreground-faint focus:border-accent";

const LABEL =
  "text-[11px] font-medium tracking-[0.14em] text-foreground-dim uppercase";

export default function ContactSection() {
  const [state, setState] = useState<SendState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const idea = String(data.get("idea") ?? "");
    const contact = String(data.get("contact") ?? "");

    if (!WEB3FORMS_ACCESS_KEY) {
      track("form_mailto_fallback");
      const body = `${idea}\n\nReach me at: ${contact}`;
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
        "An idea for you",
      )}&body=${encodeURIComponent(body)}`;
      return;
    }

    setState("pending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: "An idea for you, from the portfolio site",
          idea,
          contact,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setState("success");
        track("form_success");
        form.reset();
      } else {
        setState("error");
        track("form_error", { props: { status: res.status } });
      }
    } catch {
      setState("error");
      track("form_error", { props: { status: "network" } });
    }
  }

  const buttonLabel = {
    idle: "Send an email",
    pending: "Sending…",
    success: "Sent, I'll reply shortly",
    error: "Something went wrong, try again",
  }[state];

  return (
    <section
      id="contact"
      data-section="contact"
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
              data-track="contact-whatsapp"
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
              data-track="contact-email"
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
            data-track="contact-submit"
            disabled={state === "pending"}
            className="cursor-pointer self-start rounded-full bg-accent px-[30px] py-[15px] text-[15px] font-medium text-background transition-colors duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonLabel}
          </button>
          {state === "error" ? (
            <p className="text-sm font-light text-foreground-dim">
              That did not go through. You can retry, or email me directly at{" "}
              <Link href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">
                {CONTACT.email}
              </Link>
              .
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
