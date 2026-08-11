"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { DURATION, EASE, STAGGER } from "@/lib/motion";

const MotionLink = motion.create(Link);

const reviews = [
  {
    name: "Mamashka",
    pfp: "/pfps/mamashka.png",
    location: "United States",
    flag: "/flags/us.png",
    text: "simply the best",
    textSize: "text-3xl sm:text-4xl lg:text-5xl",
    link: "#",
    from: "Fiverr Pro Client",
  },
  {
    name: "Forexgump",
    pfp: "/pfps/forexgump.png",
    location: "Switzerland",
    flag: "/flags/switzerland.png",
    text: "Excellent work. I would work with him again anytime",
    textSize: "text-2xl sm:text-3xl lg:text-5xl",
    link: "#",
    from: "Verified Client From Fiverr",
  },
  {
    name: "Mahmoudsuprime",
    pfp: "/pfps/mahmoud.png",
    location: "Morocco",
    flag: "/flags/morocco.png",
    text: "outstanding work, highly recommend",
    textSize: "text-2xl sm:text-3xl lg:text-5xl",
    link: "#",
    from: "Verified Client From Fiverr",
  },
];

export default function ReviewsSection() {
  return (
    <section className="bg-background-lighter px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
      <div className="mx-auto flex max-w-[981px] flex-col gap-8">
        {reviews.map((review, idx) => (
          <MotionLink
            key={review.name}
            href={review.link}
            onClick={(e) => e.preventDefault()}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: DURATION,
              ease: EASE,
              delay: idx * STAGGER,
            }}
            className="rounded-[40px] bg-surface px-6 py-7 sm:rounded-[62px] sm:px-12 sm:py-10"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={review.pfp}
                  alt={review.name}
                  width={72}
                  height={72}
                  className="size-14 rounded-full object-cover sm:size-[72px]"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-normal sm:text-[1.7rem]">
                    {review.name}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-foreground-dimmer">
                    From {review.location}
                    <Image
                      src={review.flag}
                      alt=""
                      width={24}
                      height={16}
                      className="h-3.5 w-5 object-cover"
                    />
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-accent">
                  <Image
                    src="/icons/check.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                </span>
                <span className="text-sm sm:text-lg">{review.from}</span>
              </div>
            </div>
            <p
              className={
                "mt-8 text-center font-normal leading-tight text-foreground " +
                review.textSize
              }
            >
              &ldquo;{review.text}&rdquo;
            </p>
          </MotionLink>
        ))}
      </div>
    </section>
  );
}
