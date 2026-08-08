"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  { label: "SaaS", code: "saas", top: "4%", left: "14%", textSize: "text-4xl" },
  {
    label: "AI automation",
    code: "ai",
    top: "0%",
    left: "58%",
    textSize: "text-3xl",
  },
  {
    label: "code to exe",
    code: "exe",
    top: "26%",
    left: "24%",
    textSize: "text-3xl",
  },
  {
    label: "python",
    code: "python",
    top: "26%",
    left: "56%",
    textSize: "text-3xl",
  },
  {
    label: "chrome/firefox extensions",
    code: "extensions",
    top: "48%",
    left: "16%",
    textSize: "text-4xl",
  },
  {
    label: "desktop apps",
    code: "desktop",
    top: "70%",
    left: "16%",
    textSize: "text-3xl",
  },
  {
    label: "computer vision",
    code: "cv",
    top: "70%",
    left: "56%",
    textSize: "text-3xl",
  },
  {
    label: "figma web design",
    code: "figma",
    top: "90%",
    left: "32%",
    textSize: "text-3xl",
  },
];

export default function ServicesSection() {
  return (
    <section className="flex flex-col px-8 md:px-28 bg-surface">
      <div className="flex flex-col">
        <h2 className="text-5xl mx-auto sm:text-7xl font-extrabold pt-4 pb-10 tracking-tighter text-foreground font-sans cursor-default">
          Services I Provide
        </h2>

        {/* stacked for mobile and scattered on desktop */}
        <div className="flex flex-col items-center gap-3 md:hidden">
          {services.map((service, idx) => (
            <motion.div
              key={service.code}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
            >
              <Link
                href={`/chat?c=${service.code}`}
                title="Click to chat on this service :)"
                className={
                  "block rounded-full bg-surface-muted px-7 py-4 font-semibold font-sans tracking-tight hover:bg-surface cursor-pointer " +
                  service.textSize
                }
              >
                {service.label}
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="relative hidden md:block h-[70vh] max-w-4xl mx-auto w-full">
          {services.map((service, idx) => (
            <div
              key={service.code}
              className="absolute"
              style={{ top: service.top, left: service.left }}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
              >
                <Link
                  href={`/chat?c=${service.code}`}
                  title="Click to chat on this service :)"
                  className={
                    "block rounded-full bg-surface-muted px-8 py-5 font-semibold font-sans tracking-tight hover:bg-surface cursor-pointer whitespace-nowrap " +
                    service.textSize
                  }
                >
                  {service.label}
                </Link>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border border-border-harder w-full mt-36 mb-28" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center gap-4 md:gap-8 pb-22"
      >
        <p className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-sans tracking-tighter text-foreground cursor-default">
          Still Confused?
        </p>
        <div className="flex flex-col gap-1">
          <Link
            href="/chat?c=discuss"
            className="bg-accent text-background py-5 sm:py-3 rounded-full text-[26px] sm:text-[40px] font-display font-medium hover:bg-accent-hover px-10 sm:px-16 text-center"
          >
            Discuss for FREE
          </Link>
          <p className="text-sm text-muted mx-auto">
            I don&apos;t mind a friendly chat :)
          </p>
        </div>
      </motion.div>
    </section>
  );
}
