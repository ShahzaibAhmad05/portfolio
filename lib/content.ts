export type Work = {
  title: string;
  summary: string;
  tags: string[];
  image: string;
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
    tags: ["Desktop", "Computer vision", "Open source"],
    image: "/work/iris.webp",
    ratio: "16/9",
    href: "https://github.com/d-khalid/IRis",
    align: "end",
  },
  {
    title: "gitree",
    summary:
      "A command-line replacement for `ls` that reads folder structures and packages an entire codebase for an LLM prompt. Open source, published on PyPI.",
    tags: ["Developer tooling", "Python", "Open source"],
    image: "/work/gitree.webp",
    ratio: "16/9",
    href: "https://github.com/ShahzaibAhmad05/gitree",
    align: "start",
  },
  {
    title: "NextSearch",
    summary:
      "A search engine written in C++ over the 1M-article CORD-19 research corpus. Inverted index with BM25 ranking, lexicon-backed autocomplete, and AI overviews layered on top.",
    tags: ["Search systems", "C++", "AI"],
    image: "/work/nextsearch.webp",
    ratio: "4/3",
    href: "https://github.com/ShahzaibAhmad05/NextSearch-api",
    align: "end",
  },
];

/** Cards for the pinned "Turning vibe-coded / to hand-crafted" scroller, in story order. */
export const CRAFT_CARDS = [
  { src: "/craft/01-email.jpg", alt: "A client email asking for help finishing an AI-generated website" },
  { src: "/craft/02-analyze.jpg", alt: "The attached files opened for analysis" },
  { src: "/craft/03-wireframe.jpg", alt: "The vibe-coded wireframe in a design tool" },
  { src: "/craft/04-polish.jpg", alt: "Typography, colour and graphics tiles around the work in progress" },
  { src: "/craft/05-final.jpg", alt: "The finished website in the browser" },
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
