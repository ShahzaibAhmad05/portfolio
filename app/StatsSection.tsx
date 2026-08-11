"use client";

import { motion } from "framer-motion";
import { viewBelow, DURATION, EASE, STAGGER } from "@/lib/motion";

const stats = [
  {
    value: "20+",
    label: "Projects Delivered",
    delay: 0,
  },
  {
    prefix: "With",
    value: "100%",
    label: "Happy Clients",
    delay: STAGGER,
  },
  {
    prefix: "From",
    value: "6",
    label: "Different\nCountries",
    delay: STAGGER * 2,
  },
];

export default function StatsSection() {
  return (
    <section className="border-y border-border bg-background px-6 py-12 sm:px-10 sm:py-16 lg:px-20">
      <motion.div {...viewBelow} className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
        <h2 className="font-display text-[clamp(2rem,6vw,5.75rem)] leading-[0.95] text-foreground">
          3+ Years of Software Engineering
        </h2>
        <p className="mt-2 text-[clamp(1.1rem,2vw,1.75rem)] font-light text-foreground">
          Built. Improved. Optimized
        </p>
      </motion.div>

      <div className="mx-auto mt-10 flex max-w-[1200px] flex-col items-center justify-center gap-10 sm:mt-14 sm:flex-row sm:flex-wrap sm:gap-8 lg:gap-16">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: DURATION, ease: EASE, delay: stat.delay }}
            className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:gap-2"
          >
            {stat.prefix ? (
              <span className="mb-1 text-xl font-black text-foreground sm:mb-3 sm:text-3xl lg:text-[2.8rem]">
                {stat.prefix}
              </span>
            ) : null}
            <div className="flex flex-col items-center sm:items-start">
              <span className="font-display text-[clamp(3.5rem,8vw,8.4rem)] leading-none text-foreground">
                {stat.value}
              </span>
              <span className="whitespace-pre-line text-lg font-light leading-tight text-foreground sm:text-2xl lg:text-[2rem]">
                {stat.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
