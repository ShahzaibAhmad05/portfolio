"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Mamashka",
    location: "United States",
    text: "Simply the best",
    details: "Worked on .exe compilation.",
    proof:
      "https://www.fiverr.com/shahzaibahmad05/convert-your-python-projects-to-exe",
    proofTagline: "Review from Fiverr; Click to see the proof",
    featured: ["Attention to details", "Exceeded expectations"],
  },
  {
    name: "Forexgump",
    location: "Switzerland",
    text: "Excellent work. I would work with him again anytime.",
    details: "Worked on developing a python desktop app.",
    proof:
      "https://www.fiverr.com/shahzaibahmad05/convert-your-python-projects-to-exe",
    proofTagline: "Review from Fiverr; Click to see the proof",
    featured: ["Went above and beyond", "Code expertise"],
  },
  {
    name: "MahmoudSuprime",
    location: "Morocco",
    text: "Nicely done, appreciate the effort",
    details:
      "Compiled a React app using electron to work offline as a standalone exe file.",
    proof:
      "https://www.fiverr.com/shahzaibahmad05/convert-your-python-projects-to-exe",
    proofTagline: "Review from Fiverr; Click to see the proof",
    featured: ["Delivery time", "Quick responsiveness"],
  },
  {
    name: "JohnLuther",
    location: "India",
    text: "Good work",
    details: "Fixed issues with selenium chrome drivers and gmail api.",
    proof: "",
    proofTagline: "Client from WhatsApp Business;",
    featured: [],
  },
  {
    name: "Kai",
    location: "Germany",
    text: "Sent exactly what I asked for.",
    details: "Reverse engineered their legacy python software to code.",
    proof: "",
    proofTagline: "Client from WhatsApp Business;",
    featured: [],
  },
  {
    name: "baderalkalaldeh",
    location: "Jordan",
    text: "Great communication throughout the project.",
    details: "Converted a Tesla Mileage reading program to exe file.",
    proof: "",
    proofTagline: "Client from WhatsApp Business;",
    featured: [],
  },
  {
    name: "mrichardson",
    location: "United States",
    text: "very knowledgeable",
    details: "Resolved packaging errors in their PyInstaller build pipeline.",
    proof: "",
    proofTagline: "Client from WhatsApp Business;",
    featured: [],
  },
];

export default function ProofingSection() {
  return (
    <section className="flex flex-col justify-between px-8 md:px-28 bg-surface">
      <h2 className="text-5xl mx-auto sm:text-6xl font-extrabold pt-18 pb-14 tracking-tighter text-foreground font-sans">
        3+ Years Of Building Software
      </h2>

      <div className="pb-6">
        <p className="font-semibold font-sans text-4xl mb-2 sm:mb-0">
          Reviews From My Clients:
        </p>
        <p className="hidden sm:block text-muted text-sm sm:text-xs">Exact wording may differ slightly due to language differences, except in meaning.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3"
      >
        {reviews.map((review, idx) => (
          <Link
            key={idx}
            href={review.proof}
            title={review.proofTagline}
            className={
              "mb-3 flex flex-col gap-3 rounded-lg bg-surface-muted border-2 border-transparent p-4 break-inside-avoid" +
              (review.proof ? " hover:border-border" : " cursor-default")
            }
          >
            <div className="flex flex-row gap-2 items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface font-semibold">
                {review.name.charAt(0).toUpperCase()}
              </div>
              {review.proof && (<div className="flex items-center justify-center bg-accent rounded-full -ml-5 -mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5 text-surface-muted"
                  aria-hidden
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>)}
              <div className="flex flex-col">
                <span className="text-md font-bold">{review.name}</span>
                <span className="text-sm text-muted -mt-1">
                  {review.location}
                </span>
              </div>
            </div>
            <p className="text-lg">&quot;{review.text}&quot;</p>
            {review.featured.length > 0 && (
              <div className="flex flex-col gap-1">
                {/* <span className="text-md font-bold text-muted">Featured:</span> */}
                {review.featured.map((tag, idx) => (
                  <div
                    key={idx}
                    className="bg-surface text-xs rounded-xl -ml-1 mr-auto px-2.5 py-1.5"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
            <hr className="border-border-harder" />
            <p className="text-sm">{review.details}</p>
          </Link>
        ))}
      </motion.div>

      <hr className="border-border-harder my-18" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7 }}
        className="flex flex-row items-center justify-center gap-4 text-xl sm:text-4xl lg:text-6xl font-bold font-sans tracking-tight text-foreground"
      >
        <p>Check My Profile On</p>
        <Link
          href="https://github.com/ShahzaibAhmad05"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className="text-muted hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-12 md:size-16 lg:size-20"
            aria-hidden
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </Link>
        <p>&amp;</p>
        <Link
          href="https://www.linkedin.com/in/ShahzaibAhmad05"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="LinkedIn"
          className="text-muted hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-12 md:size-16 lg:size-20"
            aria-hidden
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </Link>
      </motion.div>
      <hr className="border-border-harder my-18" />
    </section>
  );
}
