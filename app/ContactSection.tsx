"use client";

import { IDEA_EVENT } from "@/components/SiteAgent";

export default function ContactSection() {
  // the site agent takes it from here: its chat opens on the idea form
  const openForm = () => window.dispatchEvent(new Event(IDEA_EVENT));

  return (
    // Pinned to the bottom of the viewport, beneath the paper layer, so it is already there as that layer
    // slides off it; once fully uncovered it lets go and scrolls on. The top 40px stays tucked under
    // Testimonials' rounded corners. The dark behind its own rounded corners matches the footer that follows.
    <div className="sticky bottom-0 bg-ink">
      <section
        id="contact"
        data-section="contact"
        className="flex min-h-[calc(clamp(520px,52.8vw,760px)+40px)] scroll-mt-12 flex-col items-center justify-center gap-11 rounded-b-[40px] bg-accent px-[clamp(20px,9.72vw,140px)] pt-34 pb-24 text-center"
      >
        <h2 className="m-0 max-w-[16ch] text-[clamp(40px,5.28vw,76px)] leading-[1.12] font-normal tracking-[-1px]">
          Ready to build your next revenue?
        </h2>
        <button
          type="button"
          onClick={openForm}
          aria-haspopup="dialog"
          className="flex h-[50px] cursor-pointer items-center gap-3.5 rounded-full bg-black pr-[26px] pl-7 text-xl leading-none text-background"
        >
          It&rsquo;s One-Click Away
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 7l10 10" />
            <path d="M17 8v9H8" />
          </svg>
        </button>
      </section>
    </div>
  );
}
