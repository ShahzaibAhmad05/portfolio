"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DURATION, EASE, STAGGER, viewBelow } from "@/lib/motion";
import { trackButtonClick } from "@/lib/stats";

type Service = {
  label: string;
  code: string;
  top: string;
  left: string;
  textClass: string;
  delay: number;
};

const services: Service[] = [
  {
    label: "SaaS",
    code: "saas",
    top: "4%",
    left: "24%",
    textClass: "text-3xl sm:text-4xl lg:text-5xl px-8 py-5",
    delay: 0,
  },
  {
    label: "AI automation",
    code: "ai",
    top: "2%",
    left: "52%",
    textClass: "text-2xl sm:text-3xl lg:text-4xl px-7 py-4",
    delay: STAGGER,
  },
  {
    label: "flutter apps",
    code: "flutter",
    top: "18%",
    left: "8%",
    textClass: "text-2xl sm:text-3xl px-7 py-4",
    delay: STAGGER * 1.5,
  },
  {
    label: "code to exe",
    code: "exe",
    top: "16%",
    left: "36%",
    textClass: "text-2xl sm:text-3xl lg:text-4xl px-7 py-4",
    delay: STAGGER * 2,
  },
  {
    label: "python",
    code: "python",
    top: "18%",
    left: "62%",
    textClass: "text-2xl sm:text-3xl px-7 py-4",
    delay: STAGGER * 2.5,
  },
  {
    label: "chrome/firefox extensions",
    code: "extensions",
    top: "34%",
    left: "22%",
    textClass: "text-2xl sm:text-3xl lg:text-4xl px-8 py-5",
    delay: STAGGER * 3,
  },
  {
    label: "electron apps",
    code: "electron",
    top: "42%",
    left: "72%",
    textClass: "text-xl sm:text-2xl lg:text-3xl px-6 py-4",
    delay: STAGGER * 3.5,
  },
  {
    label: "desktop apps",
    code: "desktop",
    top: "52%",
    left: "20%",
    textClass: "text-2xl sm:text-3xl px-7 py-4",
    delay: STAGGER * 4,
  },
  {
    label: "computer vision",
    code: "cv",
    top: "56%",
    left: "50%",
    textClass: "text-2xl sm:text-3xl lg:text-4xl px-7 py-4",
    delay: STAGGER * 4.5,
  },
  {
    label: "dotnet development",
    code: "dotnet",
    top: "68%",
    left: "2%",
    textClass: "text-xl sm:text-2xl lg:text-3xl px-6 py-3.5",
    delay: STAGGER * 5,
  },
  {
    label: "figma web design",
    code: "figma",
    top: "76%",
    left: "28%",
    textClass: "text-3xl sm:text-4xl lg:text-5xl px-10 py-5",
    delay: STAGGER * 5.5,
  },
];

function Bubble({ service }: { service: Service }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: DURATION, ease: EASE, delay: service.delay }}
    >
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          trackButtonClick(service.code);
        }}
        className={
          "inline-block rounded-full bg-surface font-normal text-foreground transition-colors hover:bg-surface/80 " +
          service.textClass
        }
      >
        {service.label}
      </Link>
    </motion.div>
  );
}

export default function ServicesSection() {
  return (
    <section className="flex flex-col">
      <div className="border-y border-border bg-background px-6 py-10 sm:px-10 sm:py-14 lg:px-20">
        <motion.h2
          {...viewBelow}
          className="text-center font-display text-[clamp(2.4rem,8vw,6.6rem)] leading-none text-foreground"
        >
          Featured Services
        </motion.h2>
      </div>

      <div className="bg-background-lighter px-6 py-14 sm:px-10 sm:py-20 lg:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 md:hidden">
          {services.map((service) => (
            <Bubble key={service.code} service={service} />
          ))}
        </div>

        <div className="relative mx-auto hidden h-[78vh] max-w-5xl md:block">
          {services.map((service) => (
            <div
              key={service.code}
              className="absolute"
              style={{ top: service.top, left: service.left }}
            >
              <Bubble service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
