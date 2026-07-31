"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  { label: "SaaS", code: "saas" },
  { label: "Python Tkinter / PyQt6 Apps", code: "tkinter" },
  { label: "Code to Exe", code: "exe" },
  { label: "Browser Extensions", code: "extensions" },
  { label: "AI Automation", code: "ai" },
  { label: "Computer Vision / OpenCV", code: "cv" },
];

export default function ServicesSection() {
  return (
    <section className="flex flex-col px-8 md:px-28 bg-surface">
      <h2 className="text-5xl mx-auto sm:text-6xl font-extrabold pt-4 pb-14 tracking-tighter text-foreground font-sans cursor-default">
        Services
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {services.map((service) => (
          <Link
            href={`/chat?c=${service.code}`}
            key={service.code}
            title="Click to chat on this service :)"
            className="rounded-lg bg-surface-muted px-5 py-4 text-xl sm:text-2xl font-semibold font-sans tracking-tight hover:bg-surface cursor-pointer"
          >
            {service.label}
          </Link>
        ))}
      </motion.div>
      <hr className="border-border-harder my-18" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pb-18"
      >
        <p className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-sans tracking-tighter text-foreground cursor-default">
          Still Confused?
        </p>
        <div className="flex flex-col gap-1">
          <Link
            href="/chat?c=discuss"
            className="bg-accent text-surface py-5 sm:py-6 rounded-3xl text-[26px] sm:text-4xl font-sans font-extrabold hover:bg-accent-hover px-10 sm:px-10 text-center"
          >
            Discuss for FREE
          </Link>
          <p className="text-sm text-muted mx-auto">I don&apos;t mind a friendly chat :)</p>
        </div>
      </motion.div>
    </section>
  );
}
