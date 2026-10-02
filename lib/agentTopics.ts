import { CONTACT } from "@/lib/content";

// Buttons an answer can carry. List any of these words in a topic's `actions`:
// the links open in a new tab, and "form" starts the idea form under the answer.
export const LINKS = {
  linkedin: { label: "LinkedIn", href: CONTACT.linkedin },
  whatsapp: { label: "WhatsApp", href: CONTACT.whatsapp },
  email: { label: "Email", href: `mailto:${CONTACT.email}` },
  mobbin: { label: "mobbin.com", href: "https://mobbin.com/" },
  awwwards: { label: "awwwards.com", href: "https://www.awwwards.com/" },
  github: { label: "GitHub", href: "https://github.com/ShahzaibAhmad05" },
  calendly: { label: "Schedule a meeting", href: CONTACT.calendly },
};
export type Action = keyof typeof LINKS | "form";

export type Topic = { q: string; a: string; actions?: Action[]; more?: Topic[] };

// Every answer is written once, here. The tree below only decides where each one is asked
// from and how the question is worded in that spot.
const A = {
  intro:
    "A full-stack developer and a third-year student of software engineering at NUST. He has been coding since before AI came in.\n\nHis top projects and their demos are here, and you can also check his GitHub profile for a closer look:",
  design:
    "Books and articles on best design practices, and taking inspiration from dozens of well-made websites every workday.\n\nMotion graphics are hard to get right and take a lot of time, so he learned to replicate perfectly designed animations with AI assistance. This has allowed him to make some breathtaking designs.\n\nApart from this, he takes inspiration from Awwwards and Mobbin, which improve the depth of his designs even further.\n\nCheck them out below if you’d like:",
  sites:
    "They are inspiration-feeding websites used by designers to get new ideas. Basically, collections of top-tier UI designs from the internet.",
  speed:
    "As fast as you want it to be.\n\nFrom what he told me, a well-made design like this portfolio takes about a week of prototyping, then another week of “feel” refinement.\n\nThe more time you can provide, the better the results.",
  rush:
    "If you have the assets (pictures and videos), content and design ideas, then it can be done in a very short time.\n\nThere is no guarantee that the design will be perfect, but he will do his best in those two days.",
  ai:
    "He uses Claude Code, which helps with accurate code generation through prompts. He used to type most of the code himself, but nowadays hand-typing it has become trivial.\n\nHe also uses Claude Design Artifacts, which help in quickly drafting design prototypes and then editing them to greatness.\n\nSimply put, it’s the Claude ecosystem.",
  coding:
    "He is doing a software engineering degree and has been coding since before AI came in. Moreover, he speaks of reading books and articles on good design practices, using well-designed sites for inspiration, and most importantly, Claude Design.",
  projects:
    "Sure, let me list them for you:\n\n1) IRis\nA logic circuit simulator that converts paper sketches of circuits into running simulations. No LLMs, no paid APIs.\nIt’s a great study tool. With over 1,000 repository clones since its launch, it is very close to a production-level application.\n\n2) gitree\nA command-line replacement for ls that reads and displays entire folder structures, with lots of options for using their file content.\nThis one has 2,500+ downloads since launch, as of recent data from PyPI analytics.\n\nYou can also check his GitHub profile for a closer look:",
  hire:
    "Whoa, that’s news!\n\nYou can reach him directly through any of these:",
  contact:
    "Sure, here you go:",
  contactSearch:
    "Where was it again? Uhmm...\n\nOh, here it is:",
  form:
    "Okay. Please type it here:",
  meeting:
    "Sure. Pick any time that works for you from his calendar:",
  timezone:
    "Pakistan time (PKT). He works from Islamabad.",
  emailText: CONTACT.email,
  whatsappText: "+923366713204",
};

const timezone: Topic = { q: "What timezone is he in?", a: A.timezone };

// The ways to get in touch that sit under every contact answer.
const reach = (formQ: string, give = "Give me"): Topic[] => [
  { q: "Can I schedule a meeting instead?", a: A.meeting, actions: ["calendly"], more: [timezone] },
  { q: formQ, a: A.form, actions: ["form"] },
  { q: `${give} his email in text`, a: A.emailText },
  { q: `${give} his WhatsApp number in text`, a: A.whatsappText },
];

// Branches that are asked from more than one place. Each takes the wording of its question.
const meet = (q: string): Topic => ({
  q,
  a: A.meeting,
  actions: ["calendly"],
  more: [
    timezone,
    {
      q: "I would rather message him",
      a: A.contact,
      actions: ["whatsapp", "email", "linkedin"],
      more: reach("Deliver him my message yourself"),
    },
  ],
});
const rushed = (q: string): Topic => ({
  q,
  a: A.rush,
  more: [
    meet("Can I discuss it with him first?"),
    {
      q: "I would like to hire him",
      a: A.hire,
      actions: ["calendly", "whatsapp", "email", "linkedin"],
      more: reach("Deliver him my message yourself"),
    },
    {
      q: "His contact details?",
      a: A.contact,
      actions: ["whatsapp", "email", "linkedin"],
      more: reach("I want to type my message from here"),
    },
  ],
});
const pace = (q: string): Topic => ({
  q,
  a: A.speed,
  more: [
    rushed("What if I give him just a day or two?"),
    meet("Can I discuss my project with him first?"),
    {
      q: "I want to hire him",
      a: A.hire,
      actions: ["calendly", "whatsapp", "email", "linkedin"],
      more: reach("Just deliver him my message"),
    },
  ],
});
const aboutSites = (q: string): Topic => ({
  q,
  a: A.sites,
  more: [
    pace("And how quick can he design?"),
    {
      q: "Give me his contact info",
      a: A.contactSearch,
      actions: ["whatsapp", "email", "linkedin"],
      more: reach("Deliver him my message directly", "Just give me"),
    },
  ],
});
const learnedDesign = (q: string): Topic => ({
  q,
  a: A.design,
  actions: ["mobbin", "awwwards"],
  more: [
    pace("How quick can he design?"),
    aboutSites("Tell me a bit about these websites"),
    {
      q: "Give me his contact info",
      a: A.contactSearch,
      actions: ["whatsapp", "email", "linkedin"],
      more: reach("Deliver him my message directly", "Just give me"),
    },
  ],
});
const built = (q: string): Topic => ({
  q,
  a: A.projects,
  actions: ["github"],
  more: [
    pace("How quick can he design?"),
    {
      q: "I would like to hire him",
      a: A.hire,
      actions: ["calendly", "whatsapp", "email", "linkedin"],
      more: reach("Deliver him my message yourself"),
    },
  ],
});
const learnedCoding = (q: string): Topic => ({
  q,
  a: A.coding,
  more: [
    learnedDesign("And how did he learn to design?"),
    built("Show me his best projects"),
    {
      q: "Give me his contact details",
      a: A.contact,
      actions: ["whatsapp", "email", "linkedin"],
      more: reach("I want to type my message from here"),
    },
  ],
});
const usesAi = (q: string): Topic => ({
  q,
  a: A.ai,
  more: [
    learnedCoding("Then where did he learn frontend and coding?"),
    built("What has he built with it?"),
    {
      q: "Give me his contact details",
      a: A.contact,
      actions: ["whatsapp", "email", "linkedin"],
      more: reach("I want to type my message from here"),
    },
  ],
});

// The chat is a tree several levels deep: a question with nothing under it answers
// and hands the menu back to the primary questions.
export const TOPICS: Topic[] = [
  {
    q: "Introduce him to me",
    a: A.intro,
    actions: ["github"],
    more: [
      learnedDesign("How did he learn to design?"),
      usesAi("What AI does he use for development?"),
      built("What are his best projects?"),
      {
        q: "I want to hire him",
        a: A.hire,
        actions: ["calendly", "whatsapp", "email", "linkedin"],
        more: reach("Just deliver him my message"),
      },
    ],
  },
  {
    q: "I want to see his best projects",
    a: A.projects,
    actions: ["github"],
    more: [
      usesAi("What AI does he use to build these?"),
      learnedDesign("How did he learn to design?"),
      pace("How quick can he design?"),
      {
        q: "I would like to hire him",
        a: A.hire,
        actions: ["calendly", "whatsapp", "email", "linkedin"],
        more: reach("Deliver him my message yourself"),
      },
    ],
  },
  usesAi("What AI does he use for development?"),
  pace("How quick can he design?"),
  meet("I want to schedule a meeting with him"),
  {
    q: "I would like to hire him",
    a: A.hire,
    actions: ["calendly", "whatsapp", "email", "linkedin"],
    more: reach("Just deliver him my message"),
  },
];
