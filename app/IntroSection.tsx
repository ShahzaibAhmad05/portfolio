"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function IntroSection() {
  const ease = [0.22, 1, 0.36, 1] as const;
  const fromRight = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease, delay: 0.2 },
  };
  const fromLeft = {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease, delay: 0.2 },
  };

  async function loginWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent=admin`,
      },
    });
  }

  return (
    <section className="relative flex flex-col h-svh items-center justify-center overflow-hidden">
      {/* floating small navbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
        className="flex flex-row absolute top-5 left-5"
      >
        <button
          type="button"
          onClick={loginWithGoogle}
          className="flex flex-row items-center gap-2 border border-border-harder my-1 pl-6 pr-14 py-2 rounded-[20px] bg-deeper cursor-pointer"
        >
          <svg
            width="21"
            height="22"
            viewBox="0 0 27 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26.7607 11.477C26.9213 12.4167 27.0013 13.3687 27 14.3225C27 18.5818 25.5023 22.1832 22.8959 24.6209H22.8994C20.6201 26.761 17.487 28 13.772 28C10.1194 28 6.61647 26.5251 4.03372 23.8996C1.45097 21.2742 0 17.7134 0 14.0005C0 10.2876 1.45097 6.72672 4.03372 4.10129C6.61647 1.47587 10.1194 0.000923771 13.772 0.000923771C17.1908 -0.039777 20.4925 1.26584 22.9854 3.6443L19.0535 7.64117C17.6322 6.26392 15.7354 5.50973 13.772 5.54124C10.1792 5.54124 7.127 8.00516 6.03902 11.323C5.46215 13.0616 5.46215 14.9445 6.03902 16.6831H6.04418C7.13733 19.9958 10.1844 22.4597 13.7772 22.4597C15.6329 22.4597 17.227 21.9767 18.4631 21.1227H18.4579C19.1756 20.6394 19.7895 20.0133 20.2626 19.2821C20.7357 18.551 21.0582 17.7299 21.2106 16.8686H13.772V11.4788H26.7607V11.477Z"
              fill="white"
            />
          </svg>
          <span className="text-lg sm:text-xl lg:text-xl">login</span>
        </button>
        <Link
          href="/chat"
          className="px-6 rounded-2xl bg-accent text-background font-bold -ml-10 text-lg sm:text-xl lg:text-xl flex items-center cursor-pointer z-1"
        >
          Chat
        </Link>
      </motion.div>
      {/* background glow -> figma generated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
        className="flex inset-0 absolute mt-[26svh] md:mt-[27svh] md:ml-[15svh] -z-1"
      >
        <svg
          width="1000"
          height="400"
          viewBox="0 0 1285 587"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="642.5"
            cy="293.5"
            rx="642.5"
            ry="293.5"
            fill="url(#paint0_radial_5_32)"
          />
          <defs>
            <radialGradient
              id="paint0_radial_5_32"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(642.5 293.5) rotate(90) scale(293.5 642.5)"
            >
              <stop stopColor="#B9B9B9" stopOpacity="0.28" />
              <stop offset="1" stopColor="#B9B9B9" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
      {/* darken effect for pfp -> figma generated */}
      <motion.div
        {...fromRight}
        className="absolute inset-0 z-3 mt-[52svh] ml-[6svh] pointer-events-none hidden md:block"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1055"
          height="304"
          viewBox="0 0 1055 304"
          fill="none"
        >
          <ellipse
            cx="829.5"
            cy="152"
            rx="829.5"
            ry="152"
            fill="url(#paint0_radial_10_389)"
          />
          <defs>
            <radialGradient
              id="paint0_radial_10_389"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(829.5 152) rotate(90) scale(152 829.5)"
            >
              <stop stopColor="#242423" stopOpacity="0.52" />
              <stop offset="1" stopColor="#242423" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>
      {/* header and picture */}
      <div className="flex flex-row items-end justify-center md:mb-[20svh] relative">
        <h1 className="relative text-foreground cursor-default leading-[0.95] md:leading-[0.78] font-normal">
          <motion.div
            {...fromLeft}
            className="relative z-0 flex flex-col"
          >
            <span className="font-display text-[48px] md:text-[77px]">Building Software</span>
            <span className="font-display text-accent text-[96px] md:text-[170px] -mt-2.5 md:mt-0">
              3XBETTER
            </span>
            <span
              className="font-display text-[60px] md:text-[110px] -mt-3.5 md:-mt-1.5"
              aria-hidden
            >
              than AI today
            </span>
          </motion.div>
          <motion.div
            {...fromLeft}
            className="absolute bottom-0 left-0 z-4 font-display text-[60px] md:text-[110px]"
          >
            than AI today
          </motion.div>
        </h1>
        <motion.div {...fromRight} className="relative z-1 flex md:-ml-32">
          <Image
            src="/pfp.png"
            alt="profile picture"
            width={602}
            height={702}
            priority
            className="hidden lg:block shrink-0 lg:w-110 mb-2"
          />
        </motion.div>
      </div>
      {/* scroll CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
        className="absolute bottom-5 sm:bottom-7 flex flex-col items-center text-foreground cursor-default"
      >
        <span className="text-lg md:text-sm tracking-wider uppercase">Scroll</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6 md:size-5 animate-nudge-y"
          aria-hidden
        >
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </motion.div>
    </section>
  );
}
