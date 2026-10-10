import type { StaticImageData } from "next/image";
// imported, not referenced by path: the build fingerprints each file (cached forever) and bakes in its size and blur preview
import iris from "@/public/work/iris.webp";
import gitree from "@/public/work/gitree.webp";
import nextsearch from "@/public/work/nextsearch.webp";
import craftEmail from "@/public/craft/01-email.webp";
import craftAnalyze from "@/public/craft/02-analyze.webp";
import craftWireframe from "@/public/craft/03-wireframe.webp";
import craftPolish from "@/public/craft/04-polish.webp";
import craftFinal from "@/public/craft/05-final.webp";

export type Work = {
  title: string;
  summary: string;
  /** the headline number, shown as the first, inked tag */
  stat: string;
  tags: string[];
  image: StaticImageData;
  /** width / height of the tile's media */
  ratio: "16/9" | "4/3";
  href: string;
  align: "start" | "center" | "end";
};

// Zigzag order: left, centred, right.
export const WORK: Work[] = [
  {
    title: "IRis + SketchLogic",
    summary:
      "A digital logic circuit simulator. Draw a circuit on paper, photograph it, and it becomes a running simulation. No LLMs, no paid APIs.",
    stat: "500+ code clones",
    tags: ["Desktop", "Computer vision", "Open source"],
    image: iris,
    ratio: "16/9",
    href: "https://github.com/d-khalid/IRis",
    align: "end",
  },
  {
    title: "gitree",
    summary:
      "A command-line replacement for `ls` that reads folder structures and packages an entire codebase for an LLM prompt. Open source, published on PyPI.",
    stat: "2k+ downloads",
    tags: ["Developer tooling", "Python", "Open source"],
    image: gitree,
    ratio: "16/9",
    href: "https://github.com/ShahzaibAhmad05/gitree",
    align: "start",
  },
  {
    title: "NextSearch",
    summary:
      "A search engine written in C++ over the 1M-article CORD-19 research corpus. Inverted index with BM25 ranking, lexicon-backed autocomplete, and AI overviews layered on top.",
    stat: "1k+ searches",
    tags: ["Search systems", "C++", "AI"],
    image: nextsearch,
    ratio: "4/3",
    href: "https://github.com/ShahzaibAhmad05/NextSearch-api",
    align: "end",
  },
];

/** Cards for the pinned "Turning vibe-coded / to hand-crafted" scroller, in story order. */
export const CRAFT_CARDS = [
  { src: craftEmail, alt: "A client email asking for help finishing an AI-generated website" },
  { src: craftAnalyze, alt: "The attached files opened for analysis" },
  { src: craftWireframe, alt: "The vibe-coded wireframe in a design tool" },
  { src: craftPolish, alt: "Typography, colour and graphics tiles around the work in progress" },
  { src: craftFinal, alt: "The finished website in the browser" },
];

export const TESTIMONIALS = [
  {
    quote: "Simply the best",
    name: "Mamashka",
    role: "Fiverr Pro client · United States",
    avatar: "/pfps/mamashka.png",
  },
  {
    quote: "Excellent work. I would work with him again anytime",
    name: "Forexgump",
    role: "Verified client · Switzerland",
    avatar: "/pfps/forexgump.png",
  },
  {
    quote: "Outstanding work, highly recommended",
    name: "Mahmoudsuprime",
    role: "Verified client · Morocco",
    avatar: "/pfps/mahmoud.png",
  },
];

export const CONTACT = {
  phone: "+92 318 4299873",
  phoneHref: "tel:+923184299873",
  email: "contact@shahzaibahmad05.me",
  whatsapp: "https://wa.me/923184299873",
  github: "https://github.com/ShahzaibAhmad05",
  linkedin: "https://www.linkedin.com/in/shahzaibahmad05/",
  pypi: "https://pypi.org/project/gitree/",
  calendly: "https://calendly.com/shahzaibahmad6789",
};
