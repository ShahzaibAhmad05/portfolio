export type CaseStudy = {
  eyebrow: string;
  title: string;
  titleSuffix?: string;
  summary: string;
  tech: string[];
  thumbnail: string;
  image?: string;
  detail: { label: string; body: string }[];
  links: { label: string; href: string }[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    eyebrow: "01 / Desktop & computer vision",
    title: "IRis",
    titleSuffix: "SketchLogic",
    summary:
      "A digital logic circuit simulator. Draw a circuit on paper, photograph it, and it becomes a running simulation. No LLMs, no paid APIs.",
    tech: ["C#", ".NET 9", "Avalonia", "YOLO", "OpenCV", "xunit"],
    thumbnail: "simulator canvas",
    image: "/work/iris.webp",
    detail: [
      {
        label: "The problem",
        body: "Existing simulators are dated, and every paper sketch has to be redrawn by hand before it can be tested.",
      },
      {
        label: "What I built",
        body: "A cross-platform desktop simulator on Avalonia with dependency injection, MVVM and a JSON serialisation layer that survives clipboard cut/copy/paste of whole circuits. Alongside it, SketchLogic: a fine-tuned YOLO detector plus OpenCV contour analysis that reads gates and wires off a photograph and reconstructs the topology. Components follow IEEE/ANSI 91-1984 shapes, and simulation frequency is adjustable per clock.",
      },
      {
        label: "Result",
        body: "Simulates a mini-CPU. Ships self-contained for Windows, Linux and macOS with CI, xunit coverage and no runtime install required.",
      },
    ],
    links: [{ label: "Repository", href: "https://github.com/d-khalid/IRis" }],
  },
  {
    eyebrow: "02 / Search systems",
    title: "NextSearch",
    summary:
      "A search engine written in C++ over the 1M-article CORD-19 research corpus. Inverted index with BM25 ranking, lexicon-backed autocomplete, and AI overviews layered on top.",
    tech: ["C++17", "BM25", "CMake", "Azure OpenAI", "REST"],
    thumbnail: "search results UI",
    detail: [
      {
        label: "The problem",
        body: "A million research papers with no fast way to rank them by relevance, and no machine big enough to hold the metadata in memory.",
      },
      {
        label: "What I built",
        body: "A segmented index (lexicon, postings, docids and a forward index per segment) with BM25 scoring across all of them. Metadata is lazy-loaded by byte offset, so startup costs about 16 bytes per document instead of the whole CSV. Three LRU caches sit in front of search, AI overviews and document summaries. Twelve REST endpoints, JWT-protected admin routes for uploading new corpus slices.",
      },
      {
        label: "Result",
        body: "Sub-50ms queries across the full corpus. New document sets index in place without a rebuild.",
      },
    ],
    links: [
      { label: "Repository", href: "https://github.com/ShahzaibAhmad05/NextSearch-api" },
    ],
  },
  {
    eyebrow: "03 / Developer tooling",
    title: "gitree",
    summary:
      "A command-line replacement for `ls` that reads folder structures and packages an entire codebase for an LLM prompt. Open source, published on PyPI.",
    tech: ["Python", "PyPI", "CLI", "Open source"],
    thumbnail: "terminal output",
    image: "/work/gitree.webp",
    detail: [
      {
        label: "The problem",
        body: "Getting a real codebase into a model's context means opening files one at a time and pasting them in order.",
      },
      {
        label: "What I built",
        body: "One command that walks the tree, respects .gitignore, filters to code extensions, and lets you pick files interactively, then copies structure and contents to the clipboard, zips them, or exports to tree, JSON or Markdown. It can also move your shell into the resolved root, so listing and navigating become a single step.",
      },
      {
        label: "Result",
        body: "Installable with `pip install gitree`. Deliberately small and readable, with outside contributors and merged pull requests.",
      },
    ],
    links: [
      { label: "PyPI", href: "https://pypi.org/project/gitree/" },
      { label: "Repository", href: "https://github.com/ShahzaibAhmad05/gitree" },
    ],
  },
];

export const SERVICES = [
  {
    number: "01",
    title: "Desktop applications",
    body: "Cross-platform tools in .NET and Avalonia, PyQt or Electron. Self-contained builds for Windows, Linux and macOS, so your users double-click one file and it runs.",
    stack: "C# · .NET · Avalonia · PyQt · Electron",
  },
  {
    number: "02",
    title: "Backends & systems",
    body: "APIs and data systems where speed is the requirement, not a nice-to-have. Indexing, ranking, caching strategy and the profiling work that makes a slow endpoint fast.",
    stack: "C++ · Python · Node · REST · SQL",
  },
  {
    number: "03",
    title: "Computer vision & AI automation",
    body: "Fine-tuned detection models, OpenCV pipelines and LLM integrations that do a specific job well, not a chatbot bolted onto a product that did not need one.",
    stack: "YOLO · OpenCV · PyTorch · Azure OpenAI",
  },
  {
    number: "04",
    title: "Web products",
    body: "Next.js and MERN builds with real billing attached: Stripe subscriptions, auth, vector search. Designed in Figma first, then built to match.",
    stack: "Next.js · React · MongoDB · Stripe · Figma",
  },
];

export const APPROACH = [
  {
    number: "01",
    title: "Scope before code",
    body: "We agree on what ships, what it costs and when. No moving targets halfway through.",
  },
  {
    number: "02",
    title: "Working builds, early",
    body: "You get something you can run and click, not screenshots of progress.",
  },
  {
    number: "03",
    title: "Tested and documented",
    body: "CI, unit tests and a README written for a human. Handoff is part of the job, not an extra.",
  },
  {
    number: "04",
    title: "You own everything",
    body: "Source, repo, credentials and deployment. No lock-in, no retainer required to keep it running.",
  },
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
    quote: "Outstanding work, highly recommend",
    name: "Mahmoudsuprime",
    role: "Verified client · Morocco",
    avatar: "/pfps/mahmoud.png",
  },
];

export const STATS = [
  { to: 3, suffix: "+", label: "Years of software engineering", accent: false },
  { to: 20, suffix: "+", label: "Projects delivered", accent: false },
  { to: 100, suffix: "%", label: "Happy clients", accent: true },
  { to: 6, suffix: "", label: "Countries served", accent: false },
];

export const CONTACT = {
  phone: "+92 318 4299873",
  phoneHref: "tel:+923184299873",
  email: "shahzaibahmad6789@gmail.com",
  whatsapp: "https://wa.me/923184299873",
  github: "https://github.com/ShahzaibAhmad05",
  linkedin: "https://www.linkedin.com/in/shahzaibahmad05/",
};
