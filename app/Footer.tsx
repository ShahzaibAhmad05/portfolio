"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "@/components/Icon";
import { DURATION, EASE, viewBelow, viewLeft, viewRight } from "@/lib/motion";
import { trackButtonClick } from "@/lib/stats";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-background px-6 pb-10 pt-16 sm:px-10 sm:pt-20 lg:px-16">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <motion.div {...viewLeft} className="flex max-w-xl flex-col gap-8">
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-black leading-tight text-foreground">
            Ready to Build
            <br />
            Your <span className="text-accent">Next Revenue?</span>
          </h2>

          <div className="flex flex-col gap-4">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                trackButtonClick("whatsapp");
              }}
              className="flex items-center gap-3 text-base text-foreground sm:text-lg"
            >
              <Icon src="/icons/phone.svg" size={30} className="size-7 sm:size-8" />
              +92 318 4299873
            </Link>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                trackButtonClick("mail");
              }}
              className="flex items-center gap-3 text-base text-foreground sm:text-lg"
            >
              <Icon
                src="/icons/mail-contact.svg"
                size={30}
                className="size-7 sm:size-8"
              />
              shahzaibahmad6789@gmail.com
            </Link>
          </div>
        </motion.div>

        <motion.form
          {...viewRight}
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full max-w-[679px] flex-col gap-4 rounded-[28px] bg-surface p-5 sm:p-8"
        >
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground sm:text-base">
              Your idea
            </span>
            <textarea
              rows={4}
              placeholder="type freely, I would treat this as highly confidential..."
              className="resize-none rounded-[14px] border-0 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground-dimmer sm:text-base"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-foreground sm:text-base">
              Any Contact info
            </span>
            <input
              type="text"
              placeholder="so I can respond back to you..."
              className="rounded-[14px] border-0 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground-dimmer sm:text-base"
            />
          </label>
          <div className="mt-2 flex justify-center sm:justify-end">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                trackButtonClick("send_email");
              }}
              className="inline-flex items-center justify-center rounded-[21px] border border-[#494545] bg-accent px-8 py-3.5 text-base font-medium text-black transition-colors hover:bg-accent-hover"
            >
              Send an Email
            </Link>
          </div>
        </motion.form>
      </div>

      <motion.div
        {...viewBelow}
        transition={{ duration: DURATION, ease: EASE, delay: 0.1 }}
        className="relative mx-auto mt-16 flex max-w-[1440px] flex-col items-center"
      >
        <p className="font-display text-[clamp(4rem,22vw,12.8rem)] leading-none text-accent">
          Shahzaib<span className="text-foreground">.</span>
        </p>
        <p className="-mt-2 text-lg font-light text-foreground sm:-mt-4 sm:text-2xl lg:text-[1.75rem]">
          Software Engineer
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: DURATION, ease: EASE, delay: 0.15 }}
        className="mt-10 text-center text-sm text-foreground-dim"
      >
        © {year} Shahzaib Ahmad Shahid. All rights reserved.
      </motion.p>
    </footer>
  );
}
