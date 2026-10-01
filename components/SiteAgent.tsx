"use client";

import Lenis from "lenis";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTACT } from "@/lib/content";

/*
 * The site agent: a fuzzy dot sphere with eyes that rides the page, springs to a
 * new spot as sections change, talks in little typed bubbles, and opens a chat.
 * Everything is drawn on one fixed canvas. Each section owns one resting spot;
 * every frame the agent chases that spot with a damped spring. Desktop pointers only.
 */

// ---- Tunables (px on the 1440 x 900 design frame, ms for time) ---------------
const TUNE = {
  BLINK_MIN_MS: 3000,
  BLINK_MAX_MS: 6000,
  BLINK_CLOSE_MS: 120,
  DOUBLE_BLINK_CHANCE: 0.25,
  SPRING_K: 52, // position spring: settles in ~0.9s with a hair of overshoot
  SPRING_DAMP: 12.6,
  MAX_SPEED: 2800, // px/s
  SIZE_K: 90,
  SIZE_DAMP: 13,
  ACTIVE_LINE: 0.48, // the section under this fraction of the viewport owns the agent
  PAD_X: 120, // the resting spot never gets closer than this to a screen edge
  PAD_TOP: 130,
  PAD_BOTTOM: 140,
  PAD_BODY: 36, // ...or this much clear of the agent's own radius, if that is more
  LEAN_RANGE: 420, // pointer within this distance pulls the agent toward it
  LEAN_X: 16,
  LEAN_Y: 12,
  DRIFT_X: 26, // lazy float, giant contact state only
  DRIFT_Y: 18,
  DRIFT_X_RATE: 0.00052,
  DRIFT_Y_RATE: 0.00041,
  SIZE_SMALL: 64,
  SIZE_DEFAULT: 140,
  SIZE_WORK: 158,
  SIZE_HUGE: 400,
  HUGE_FROM: 300, // at or above this size: sparse ring, big nose, half-closed lids
  HUGE_LID: 0.45,
  PARTICLES: 396,
  EDGE_BIAS: 0.318,
  INNER_BIAS: 0.35,
  DOT_SIZE: 0.72,
  DOT_SPEED: 0.0028,
  NOSE_PX: 20,
  DOT_ALPHA_MIN: 0.45,
  DOT_ALPHA_MAX: 1,
  TYPE_MS: 32,
  HOLD_MS: 2400,
  TIP_POP_MS: 220,
  TIP_FADE_MS: 350,
  NEAR_PX: 70,
  REST_MS: 1200,
  TIP_COOLDOWN_MS: 5000,
  CURSOR_MS: 300,
  CURSOR_DOT_PX: 16,
  CURSOR_RING_PX: 44,
  CURSOR_BORDER_PX: 2,
  CURSOR_LABEL_SPACING: "0.6px",
};
const ACCENT = "#FFF714";
const INK = "#1D1E19";
// the agent's seat in the chat header: its hero size, which scales with the viewport like `ss` does
const SEAT_SIZE = `clamp(${TUNE.SIZE_SMALL * 0.75}px, ${(TUNE.SIZE_SMALL / 1440) * 100}vw, ${TUNE.SIZE_SMALL * 1.25}px)`;
const CURSOR_INK = "#0E0E0C";
const CURSOR_FILL = "#FFFFFF";
// hovering these turns the cursor into a hollow ring
const CURSOR_RING = 'header a, footer a, #craft a[href="#contact"], [aria-haspopup="dialog"]';

// x, y are fractions of the section's box, or of the viewport when `screen` is set
type Spot = { x: number; y: number; size: number; screen?: boolean; drift?: boolean };
type Section = Spot & { id: string; dark: boolean; line: string };

// Matched to the [data-section] ids on the page.
const SECTIONS: Section[] = [
  { id: "hero", dark: false, line: "Hi. I live here.", x: 0.95, y: 0.21, screen: true, size: TUNE.SIZE_SMALL },
  { id: "work", dark: false, line: "Products with actual users.", x: 0.2, y: 0.42, size: TUNE.SIZE_WORK },
  { id: "craft", dark: false, line: "Scroll this slowly.", x: 0.8, y: 0.44, size: TUNE.SIZE_DEFAULT },
  { id: "testimonials", dark: false, line: "All Verified Feedback.", x: 0.1, y: 0.52, size: TUNE.SIZE_DEFAULT },
  { id: "contact", dark: false, line: "Go on, press it.", x: 0.82, y: 0.6, size: TUNE.SIZE_HUGE, drift: true },
  // sits high, in the empty top-right of the footer, clear of the wordmark
  { id: "footer", dark: true, line: "The end!", x: 0.9, y: 0.3, size: TUNE.SIZE_DEFAULT },
];

const NEAR_LINES = ["Oh, hello.", "Did you know I talked?", "I’m observing.", "Click me. I won’t bite.", "Personal space. Kidding."];
const REST_LINES = ["Still there? Click me.", "Staring contest. You lose.", "I can do this all day."];

// Buttons an answer can carry. List any of these words in a topic's `actions`:
// the links open in a new tab, and "form" starts the idea form under the answer.
const LINKS = {
  linkedin: { label: "LinkedIn", href: CONTACT.linkedin },
  whatsapp: { label: "WhatsApp", href: CONTACT.whatsapp },
  email: { label: "Email", href: `mailto:${CONTACT.email}` },
};
type Action = keyof typeof LINKS | "form";

type Topic = { q: string; a: string; actions?: Action[]; more?: Topic[] };

const IRIS_REPO = "github.com/d-khalid/IRis";
const GITREE_REPO = "github.com/ShahzaibAhmad05/gitree";
const NEXTSEARCH_REPO = "github.com/ShahzaibAhmad05/NextSearch-api";

// The chat is a tree three levels deep: primary questions, each opening secondary
// ones, some of which open tertiary ones. A question with nothing under it answers
// and hands the menu back to the primary questions.
const TOPICS: Topic[] = [
  {
    q: "How did Shahzaib build this portfolio?",
    a: "A few pieces from here and there. Claude helped him put it all together and make it consistent. \n\nIt was fully done in two days, then refined slowly till now.",
    more: [
      {
        q: "Can he build a website better than this for me?",
        a: "Sure he can. Build quality depends on the time he spends on it. Go on, give him some time and money, and you’ll see good results.\n\nHe always underpromises and overdelivers.",
        more: [
          { q: "Provide me with his contact info.", a: "Here you go.", actions: ["email", "whatsapp", "linkedin"] },
          { q: "I want to message him instantly.", a: `Sure, go on.`, actions: ["whatsapp"] },
        ],
      },
      {
        q: "So, is he a vibe-coder?",
        a: "Well, no. He is aware of and familiar with useful technical details. Just don’t go on asking about the syntax because knowing it is not a big deal.",
        more: [
          { q: "Then where did he learn frontend and coding?", a: "He has a software engineering degree and has been coding since before AI came in. Moreover, he speaks of reading books and articles on good design practices, using well-designed sites for inspiration, and most importantly, Claude design." },
          { q: "Give me his contact details.", a: "Sure, here you go.", actions: ["email", "whatsapp", "linkedin"] },
        ],
      },
    ],
  },
  {
    q: "Show me real projects",
    a: "Three you can look at right now: IRis + SketchLogic, NextSearch and gitree. Which one?",
    more: [
      {
        q: "What is IRis + SketchLogic?",
        a: "A digital logic circuit simulator for the desktop. Draw a circuit on paper, photograph it, and it becomes a running simulation. No LLMs, no paid APIs.",
        more: [{ q: "Where can I see it?", a: `It’s open on GitHub: ${IRIS_REPO}` }],
      },
      {
        q: "What is NextSearch?",
        a: "A search engine written in C++ over the 1M-article CORD-19 research corpus, with BM25 ranking, autocomplete and AI overviews. It answers in under 50ms.",
        more: [{ q: "Where can I see it?", a: `The API is on GitHub: ${NEXTSEARCH_REPO}` }],
      },
      {
        q: "What is gitree?",
        a: "A command-line replacement for ls that reads folder structures and packages an entire codebase for an LLM prompt. Open source, published on PyPI.",
        more: [{ q: "Where can I get it?", a: `pip install gitree, or read the code at ${GITREE_REPO}` }],
      },
    ],
  },
  {
    q: "What are his OSS contributions?",
    a: "He has three open-source projects available on GitHub: IRis, NextSearch, gitree.\n\nWhich one would you like to see?",
    more: [
      { q: "IRis, the digital logic simulator", a: `Yes: ${IRIS_REPO}` },
      {
        q: "gitree, a CLI-based tool",
        a: "On PyPI, so it’s one command away: pip install gitree",
        more: [{ q: "Can I contribute?", a: `It already has outside contributors and merged PRs, so yes. Start at ${GITREE_REPO}` }],
      },
      { q: "NextSearch, a Search Engine", a: `Yes: ${IRIS_REPO}` },
    ],
  },
  {
    q: "Book a call with Shahzaib",
    a: `Quickest route: WhatsApp ${CONTACT.phone}, or email ${CONTACT.email}. He works from Islamabad (PKT).`,
    actions: ["whatsapp", "email"],
    more: [
      { q: "What’s the fastest way to reach him?", a: `WhatsApp, on ${CONTACT.phone}.`, actions: ["whatsapp"] },
      { q: "Can I email instead?", a: `Of course: ${CONTACT.email}. Replies usually land within a day.`, actions: ["email"] },
      { q: "What timezone is he in?", a: "Pakistan time (PKT). He works from Islamabad." },
    ],
  },
];
// The idea form is a short exchange: the agent asks for the message, then for a way to reach
// back, and only then sends the two together.
const IDEA_ASK = "What do you want done? Type it out below.";
const IDEA_ASK_CONTACT = "Got it. Now, we need some way for Shahzaib to reach back. Email, WhatsApp, LinkedIn, X, anything goes.";
const IDEA_SENT = "Done, it’s sent. Shahzaib will reply to you soon.";

const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

/** Email an idea to Shahzaib through Web3Forms. */
async function sendIdea(idea: string, contact: string): Promise<boolean> {
  if (!WEB3FORMS_ACCESS_KEY) {
    console.error("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is not set, so the idea form cannot send.");
    return false;
  }
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: "An idea for you, from the portfolio site",
        idea,
        contact,
      }),
    });
    const result = await res.json();
    return res.ok && Boolean(result.success);
  } catch {
    return false;
  }
}

// chat pacing, ms
const CHAT = { THINK_DELAY: 280, THINK: 620, TYPE_TICK: 18, TYPE_CHARS: 2, CHIP_STAGGER: 45, SCROLL_S: 0.9, FOLLOW_LERP: 0.16 };
// the chat opens on one of these, picked at random
const INTROS = [
  "Hey, I’m a resident here. I don’t waste other’s time so I put quick options here.",
  "Oh good, a visitor. I know this guy so ask me anything about him here.",
  "Hi. Noticed you scrolling around before. What would you like to know?",
  "Congratulations on clicking me. Now pick a topic below and let’s talk.",
];
const pickIntro = () => INTROS[Math.floor(Math.random() * INTROS.length)];

type Dot = { r: number; x: number; y: number; s: number; a: number; ph: number; sp: number };
// one run of the idea form: both answers stay editable until the send goes through
type Idea = { idea: string; contact: string; stage: "idea" | "contact" | "sending" | "sent"; failed: boolean };
const NEW_IDEA: Idea = { idea: "", contact: "", stage: "idea", failed: false };
type Field = { run: number; kind: "idea" | "contact" };
type Message = { from: "bot" | "you"; text: string; actions?: Action[]; field?: Field };
type ChatStart = "menu" | "idea";

// cubic-bezier(x1, y1, x2, y2) as a function of t, solved for x with Newton steps
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const a = (p1: number, p2: number) => 1 - 3 * p2 + 3 * p1;
  const b = (p1: number, p2: number) => 3 * p2 - 6 * p1;
  const c = (p1: number) => 3 * p1;
  const at = (t: number, p1: number, p2: number) => ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t;
  const slope = (t: number, p1: number, p2: number) => 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1);
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (Math.abs(s) < 1e-6) break;
      t -= (at(t, x1, x2) - x) / s;
    }
    return at(t, y1, y2);
  };
}
const EASE = bezier(0.16, 1, 0.3, 1);

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function makeDot(r: number): Dot {
  const th = Math.random() * Math.PI * 2;
  return {
    r,
    x: Math.cos(th) * r,
    y: Math.sin(th) * r,
    s: 0.9 + Math.random() * 0.7,
    a: TUNE.DOT_ALPHA_MIN + Math.random() * (TUNE.DOT_ALPHA_MAX - TUNE.DOT_ALPHA_MIN),
    ph: Math.random() * 6.283,
    sp: 0.7 + Math.random() * 1.3,
  };
}

function makeDots() {
  const pts: Dot[] = [];
  const kRim = TUNE.EDGE_BIAS, kIn = TUNE.INNER_BIAS;
  // pow < 1 pushes dots toward the rim, so the edge reads denser than the middle
  for (let i = 0; i < TUNE.PARTICLES; i++) pts.push(makeDot(Math.pow(Math.random(), kRim)));
  // top the inside back up to INNER_BIAS density without touching the rim
  for (let i = 0; i < TUNE.PARTICLES; i++) {
    const r = Math.pow(Math.random(), kIn);
    const keep = 1 - (kIn / kRim) * Math.pow(r, 1 / kRim - 1 / kIn);
    if (Math.random() < keep) pts.push(makeDot(r));
  }
  return pts;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  // true circular corners, so a square with r = half its side is a full circle
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FIELD =
  "w-full rounded-xl border border-on-ink/20 bg-on-ink/5 px-3.5 py-3 text-[15px] leading-[22px] text-background outline-none transition-colors duration-150 placeholder:text-on-ink/45 focus:border-on-ink/60";
const ACTION =
  "rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold tracking-[-0.2px] text-black transition-opacity duration-150 hover:opacity-85";

/** One question of the idea form, as it sits inside the agent's bubble: a box to type in and a Done button. */
function IdeaField({
  kind,
  run,
  onChange,
  onDone,
}: {
  kind: Field["kind"];
  run: Idea;
  onChange: (value: string) => void;
  onDone: () => void;
}) {
  const locked = run.stage === "sent";
  const sending = run.stage === "sending";
  // the message's Done goes once it is pressed; the contact's stays until the send lands
  const done = kind === "idea" ? run.stage === "idea" : !locked;
  const field = `${FIELD} read-only:border-on-ink/10 read-only:text-on-ink/60`;

  return (
    <form
      className="agent-in mt-3 flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onDone();
      }}
    >
      {kind === "idea" ? (
        <textarea
          rows={4}
          required
          autoFocus
          readOnly={locked}
          value={run.idea}
          onChange={(e) => onChange(e.target.value)}
          aria-label="What you want done"
          placeholder="I would treat this as highly confidential"
          className={`${field} resize-none [scrollbar-color:#4A4B45_transparent] [scrollbar-width:thin]`}
          data-lenis-prevent
        />
      ) : (
        <input
          type="text"
          required
          autoFocus
          readOnly={locked}
          value={run.contact}
          onChange={(e) => onChange(e.target.value)}
          aria-label="How to reach you"
          placeholder="Any contact information"
          className={field}
        />
      )}
      {done ? (
        <button type="submit" disabled={sending} className={`${ACTION} mt-1 self-start px-5 py-2 disabled:opacity-60`}>
          {sending ? "Sending…" : "Done"}
        </button>
      ) : null}
      {kind === "contact" && run.failed ? (
        <p className="m-0 text-sm text-on-ink/70">That did not go through. Press Done to try again, or write to {CONTACT.email}.</p>
      ) : null}
    </form>
  );
}

/**
 * The chat dialog. It holds its own state, so closing it (unmounting) forgets the conversation.
 * `start` picks the opening: the usual intro, or straight to the idea form. `closeButton` is for
 * when there is no agent on screen to sit in the header and be clicked.
 */
function AgentChat({ start, closeButton, onClose }: { start: ChatStart; closeButton: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<string | null>(null); // the reply being typed; "" is the thinking dots
  const [busy, setBusy] = useState(true);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([NEW_IDEA]); // run 0 belongs to the opening, when it is the form
  const msgsRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const scroller = useRef<Lenis | null>(null);
  const greeted = useRef(false);

  // think for a beat, then type the reply out; its buttons arrive once the text is all there
  const typeOut = useCallback((text: string, extra?: Pick<Message, "actions" | "field">, done?: () => void) => {
    timers.current.push(window.setTimeout(() => setDraft(""), CHAT.THINK_DELAY));
    timers.current.push(
      window.setTimeout(() => {
        let n = 0;
        const id = window.setInterval(() => {
          n = Math.min(text.length, n + CHAT.TYPE_CHARS);
          if (n < text.length) return setDraft(text.slice(0, n));
          clearInterval(id);
          setDraft(null);
          setMessages((prev) => [...prev, { from: "bot", text, ...extra }]);
          setBusy(false);
          done?.();
        }, CHAT.TYPE_TICK);
        timers.current.push(id);
      }, CHAT.THINK_DELAY + CHAT.THINK),
    );
  }, []);

  // one opening per conversation, even if this effect runs again (strict mode, hot reload)
  useEffect(() => {
    const greet = () => (greeted.current = true);
    if (!greeted.current) {
      if (start === "idea") typeOut(IDEA_ASK, { field: { run: 0, kind: "idea" } }, greet);
      else typeOut(pickIntro(), undefined, greet);
    }
    const pending = timers.current;
    return () => pending.splice(0).forEach((id) => clearTimeout(id));
  }, [typeOut, start]);

  // the message list gets its own Lenis, a touch quicker than the page's
  useEffect(() => {
    const wrapper = msgsRef.current;
    const content = wrapper?.firstElementChild;
    if (!wrapper || !(content instanceof HTMLElement)) return;
    const lenis = new Lenis({ wrapper, content, autoRaf: true, duration: CHAT.SCROLL_S, wheelMultiplier: 0.9 });
    scroller.current = lenis;
    return () => {
      scroller.current = null;
      lenis.destroy();
    };
  }, []);

  // follow the conversation down as it grows
  useEffect(() => {
    const lenis = scroller.current;
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(lenis.limit, { lerp: CHAT.FOLLOW_LERP });
  }, [messages, draft]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  const ask = (t: Topic) => {
    setMessages((prev) => [...prev, { from: "you", text: t.q }]);
    // go a level deeper, or back to the primary questions when this one is a dead end
    setTopic(t.more ? t : null);
    setBusy(true);
    const actions = t.actions?.filter((x) => x !== "form");
    if (t.actions?.includes("form")) {
      // "form" starts a fresh run of the idea form under this answer
      setIdeas((prev) => [...prev, NEW_IDEA]);
      typeOut(t.a, { actions, field: { run: ideas.length, kind: "idea" } });
    } else typeOut(t.a, { actions });
  };
  const back = () => setTopic(null);

  const setIdea = (run: number, patch: Partial<Idea>) =>
    setIdeas((prev) => prev.map((x, i) => (i === run ? { ...x, ...patch } : x)));

  // message written: ask how to reach back. Nothing is sent or locked yet.
  const messageDone = (run: number) => {
    if (!ideas[run].idea.trim()) return;
    setIdea(run, { stage: "contact" });
    setBusy(true);
    typeOut(IDEA_ASK_CONTACT, { field: { run, kind: "contact" } });
  };
  // contact given: send both, then lock them and say so
  const contactDone = async (run: number) => {
    const { idea, contact, stage } = ideas[run];
    if (stage !== "contact" || !idea.trim() || !contact.trim()) return;
    setIdea(run, { stage: "sending", failed: false });
    if (!(await sendIdea(idea.trim(), contact.trim()))) return setIdea(run, { stage: "contact", failed: true });
    setIdea(run, { stage: "sent" });
    setBusy(true);
    typeOut(IDEA_SENT);
  };

  // the reply in progress shares the key its finished bubble will get, so it never re-animates
  const shown: Message[] = draft === null ? messages : [...messages, { from: "bot", text: draft }];
  const options = topic?.more ?? TOPICS;
  const chip = "agent-in rounded-full border px-3.5 py-2 text-sm tracking-[-0.2px] transition-colors duration-150";

  return (
    <div
      className="agent-fade fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(21,22,18,0.35)] backdrop-blur-[8px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-lenis-prevent
    >
      <div
        role="dialog"
        aria-label="Live session"
        className="flex h-[min(560px,calc(100dvh-32px))] w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden rounded-[20px] border border-[#84BDFF] bg-ink text-background shadow-[0_30px_80px_rgba(21,22,18,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-on-ink/12 px-[22px] py-2.5">
          <span className="flex items-center gap-2.5 font-mono text-xs font-medium tracking-[0.08em] uppercase">
            <span className="size-2 rounded-full bg-[#03AC47]" />
            Mascot · Live session
          </span>
          {closeButton ? (
            <button
              type="button"
              onClick={onClose}
              className="my-2 rounded-full border border-on-ink/20 px-3.5 py-2 font-mono text-xs tracking-[0.08em] text-on-ink/70 uppercase"
            >
              Close
            </button>
          ) : (
            // the agent parks here at its hero size while the chat is open; clicking it closes the chat
            <span data-agent-seat aria-hidden className="shrink-0" style={{ width: SEAT_SIZE, height: SEAT_SIZE }} />
          )}
        </div>
        <div ref={msgsRef} className="min-h-0 grow overflow-y-auto [scrollbar-color:#4A4B45_transparent] [scrollbar-width:thin]">
          <div className="flex flex-col gap-2.5 p-[22px]">
            {shown.map((m, i) => {
              const links = (m.actions ?? []).filter((x) => x !== "form") as (keyof typeof LINKS)[];
              const field = m.field;
              return (
                <div
                  key={i}
                  className={`agent-in whitespace-pre-line rounded-[14px] px-4 py-3 text-[15px] leading-[22px] tracking-[-0.2px] ${
                    m.from === "bot" ? "self-start bg-on-ink/8 text-background" : "self-end bg-accent text-black"
                  } ${field ? "w-full" : "max-w-[82%]"}`}
                >
                  {m.text || (
                    <span aria-label="Typing" className="flex h-[22px] items-center gap-1">
                      {[0, 1, 2].map((d) => (
                        <span key={d} className="agent-dot size-1.5 rounded-full bg-on-ink/70" style={{ animationDelay: `${d * 140}ms` }} />
                      ))}
                    </span>
                  )}
                  {links.length ? (
                    <span className="agent-in mt-3 flex flex-wrap gap-2">
                      {links.map((x) => (
                        <a key={x} href={LINKS[x].href} target="_blank" rel="noreferrer" className={ACTION}>
                          {LINKS[x].label} ↗
                        </a>
                      ))}
                    </span>
                  ) : null}
                  {field ? (
                    <IdeaField
                      kind={field.kind}
                      run={ideas[field.run]}
                      onChange={(value) => setIdea(field.run, { [field.kind]: value })}
                      onDone={() => (field.kind === "idea" ? messageDone(field.run) : contactDone(field.run))}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        {/* while a reply is typing the next menu holds its space unseen, then its pills rise in one by one */}
        <div
          key={`${topic?.q ?? "menu"}-${busy}`}
          className={`flex flex-wrap gap-2 border-t border-on-ink/12 px-[22px] pt-4 pb-[22px] ${busy ? "pointer-events-none invisible" : ""}`}
        >
          {options.map((t, i) => (
            <button
              key={t.q}
              type="button"
              onClick={() => ask(t)}
              className={`${chip} border-on-ink/25 text-background hover:border-on-ink/70`}
              style={{ animationDelay: `${i * CHAT.CHIP_STAGGER}ms` }}
            >
              {t.q}
            </button>
          ))}
          {topic ? (
            <button
              type="button"
              onClick={back}
              className={`${chip} border-transparent bg-on-ink/10 text-on-ink/80 hover:bg-on-ink/20`}
              style={{ animationDelay: `${options.length * CHAT.CHIP_STAGGER}ms` }}
            >
              ← Back to menu
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Dispatch on window to open the chat straight on the idea form. */
export const IDEA_EVENT = "agent:idea";

export default function SiteAgent() {
  const [enabled, setEnabled] = useState(false);
  const [chat, setChat] = useState<ChatStart | false>(false);
  const chatOpen = chat !== false;
  const closeChat = useCallback(() => setChat(false), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const chatOpenRef = useRef(false);
  const lenis = useLenis();

  // Fine pointer, room to move, and motion allowed: otherwise the agent stays home.
  useEffect(() => {
    const fine = matchMedia("(pointer: fine)");
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setEnabled(fine.matches && !calm.matches && innerWidth >= 900);
    check();
    addEventListener("resize", check);
    return () => removeEventListener("resize", check);
  }, []);

  // anything on the page can open the chat on the idea form by dispatching this event
  useEffect(() => {
    const onIdea = () => setChat("idea");
    addEventListener(IDEA_EVENT, onIdea);
    return () => removeEventListener(IDEA_EVENT, onIdea);
  }, []);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
    if (chatOpen) lenis?.stop();
    else lenis?.start();
  }, [chatOpen, lenis]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    document.documentElement.classList.add("agent-cursor");

    const dots = makeDots();
    // next/font renames the self-hosted face, so read the real stack off the page
    const sans = getComputedStyle(document.body).fontFamily;
    let dpr = 1, vw = innerWidth, vh = innerHeight, ss = 1;
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      vw = innerWidth;
      vh = innerHeight;
      ss = clamp(vw / 1440, 0.75, 1.25);
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
    };
    resize();
    addEventListener("resize", resize);

    // agent state
    type Pt = { x: number; y: number };
    let pos: Pt | null = null;
    const vel: Pt = { x: 0, y: 0 };
    let size = TUNE.SIZE_SMALL * ss;
    let sizeVel = 0;
    let secId = "";
    let tip: null | { text: string; start: number } = null;
    let lastTipAt = -1e9;
    let wasNear = false;
    let restSince = 0;
    let lastT = 0;
    const blink = { next: 0, start: -1, again: false };
    const cursor = { x: vw / 2, y: vh / 2, w: TUNE.CURSOR_DOT_PX, h: TUNE.CURSOR_DOT_PX, fill: 1 };
    let mouse: { x: number; y: number } | null = null;
    let hoverLabel: string | null = null, hoverRing = false, inModal = false;

    const say = (text: string, force = false) => {
      const now = performance.now();
      if (!force && now - lastTipAt < TUNE.TIP_COOLDOWN_MS) return;
      tip = { text, start: now };
      lastTipAt = now;
    };

    const scheduleBlink = (now: number) => {
      blink.next = now + TUNE.BLINK_MIN_MS + Math.random() * (TUNE.BLINK_MAX_MS - TUNE.BLINK_MIN_MS);
      blink.again = Math.random() < TUNE.DOUBLE_BLINK_CHANCE;
    };
    const blinkAmount = (now: number) => {
      if (blink.start < 0 && now >= blink.next) blink.start = now;
      if (blink.start < 0 || now < blink.start) return 0;
      const d = now - blink.start, shut = TUNE.BLINK_CLOSE_MS;
      if (d < 60) return d / 60;
      if (d < 60 + shut) return 1;
      if (d < 120 + shut) return 1 - (d - 60 - shut) / 60;
      if (blink.again) {
        blink.again = false;
        blink.start = now + 90;
      } else {
        blink.start = -1;
        scheduleBlink(now);
      }
      return 0;
    };
    scheduleBlink(performance.now());

    // which [data-section] owns a given screen y
    const locate = (y: number) => {
      const els = document.querySelectorAll<HTMLElement>("[data-section]");
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (y < rect.top || y >= rect.bottom) continue;
        const sec = SECTIONS.find((s) => s.id === el.dataset.section);
        if (sec) return { sec, rect, el };
      }
      // in a gap between sections: fall back to the hero spot
      return { sec: SECTIONS[0], rect: null, el: null };
    };

    // Sections can mark inner blocks with [data-agent-stop] (the project cards).
    // The agent then keeps company with whichever block is at the active line,
    // sitting in the wider empty gutter beside it, so it shifts sideways as the
    // blocks alternate between start, center and end.
    const stopIn = (section: Element, y: number) => {
      let best: DOMRect | null = null, bestD = Infinity;
      for (const el of section.querySelectorAll("[data-agent-stop]")) {
        const r = el.getBoundingClientRect();
        const d = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
        if (d < bestD) {
          bestD = d;
          best = r;
        }
      }
      return best;
    };

    // a..b can invert on a short viewport with a big agent; settle for the middle
    const fit = (v: number, a: number, b: number) => (a > b ? (a + b) / 2 : clamp(v, a, b));

    // Where the agent wants to rest right now. Inside a section the spot is pinned
    // to the section, so it scrolls 1:1 with the page until it meets the top or
    // bottom pad; x only ever changes when the active section does.
    const restingSpot = (spot: Spot, rect: DOMRect | null, stop: DOMRect | null): Pt => {
      if (spot.screen || !rect) return { x: vw * spot.x, y: vh * spot.y };
      const body = (spot.size * ss) / 2 + TUNE.PAD_BODY;
      const padX = Math.max(TUNE.PAD_X, body);
      const box = stop ?? rect;
      let x = rect.left + rect.width * spot.x;
      if (stop) {
        const left = stop.left, right = vw - stop.right;
        // near-equal gutters (a centered block): stay on the side it is already on
        const goLeft = Math.abs(left - right) < 8 ? (pos ? pos.x < vw / 2 : spot.x < 0.5) : left > right;
        x = goLeft ? left / 2 : vw - right / 2;
      }
      return {
        x: fit(x, padX, vw - padX),
        y: fit(box.top + box.height * spot.y, Math.max(TUNE.PAD_TOP, body), vh - Math.max(TUNE.PAD_BOTTOM, body)),
      };
    };

    const drawAgent = (x: number, y: number, R: number, dark: boolean, look: { x: number; y: number }, blinkAmt: number, t: number) => {
      const huge = R * 2 >= TUNE.HUGE_FROM * ss;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = dark ? ACCENT : INK;
      const k = R / 25;
      for (let i = 0; i < dots.length; i++) {
        const p = dots[i];
        // huge: a sparse, ring-like sphere with wide gaps
        if (huge && !(p.r > 0.62 || i % 4 === 0)) continue;
        const w = t * TUNE.DOT_SPEED * p.sp + p.ph;
        ctx.globalAlpha = clamp(p.a + 0.06 * Math.sin(w * 2), TUNE.DOT_ALPHA_MIN, TUNE.DOT_ALPHA_MAX);
        ctx.beginPath();
        ctx.arc((p.x + Math.sin(w) * 0.035) * R, (p.y + Math.cos(w * 1.3) * 0.035) * R, Math.max(0.7, p.s * k * TUNE.DOT_SIZE * (huge ? 0.55 : 1)), 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // nose sits behind the eyes: a fixed 20px circle, or a big oval when huge
      ctx.fillStyle = dark ? ACCENT : INK;
      ctx.beginPath();
      if (huge) ctx.ellipse(0, 0.2 * R, 0.2 * R, 0.15 * R, 0, 0, 6.283);
      else ctx.arc(0, 0.2 * R, (TUNE.NOSE_PX * ss) / 2, 0, 6.283);
      ctx.fill();

      const gap = 0.34 * R, er = 0.26 * R, pr = er * 0.52;
      const lid = Math.max(blinkAmt, huge ? TUNE.HUGE_LID : 0);
      for (const side of [-1, 1]) {
        const ex = side * gap, ey = -0.06 * R;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, 6.283);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        if (!dark) {
          ctx.strokeStyle = "rgba(29,30,25,0.85)";
          ctx.lineWidth = Math.max(0.6, R * 0.03);
          ctx.stroke();
        }
        ctx.clip();
        if (lid < 0.95) {
          const dx = look.x - (x + ex), dy = look.y - (y + ey);
          const d = Math.hypot(dx, dy) || 1;
          const m = Math.min(1, d / 120) * (er - pr - 0.6);
          ctx.fillStyle = INK;
          ctx.beginPath();
          ctx.arc(ex + (dx / d) * m, ey + (dy / d) * m, pr, 0, 6.283);
          ctx.fill();
        }
        // lids drop from the top: a blink shuts them, the huge state rests half-closed
        if (lid > 0) {
          ctx.fillStyle = INK;
          ctx.fillRect(ex - er, ey - er, er * 2, er * 2 * lid);
        }
        ctx.restore();
      }
      ctx.restore();
    };

    const drawTip = (now: number, dark: boolean, R: number) => {
      if (!tip || !pos || chatOpenRef.current) return;
      const n = tip.text.length;
      const age = now - tip.start;
      const life = n * TUNE.TYPE_MS + TUNE.HOLD_MS;
      if (age > life + TUNE.TIP_FADE_MS) {
        tip = null;
        return;
      }
      const shown = Math.min(n, Math.floor(age / TUNE.TYPE_MS) + 1);
      const fade = age > life ? 1 - (age - life) / TUNE.TIP_FADE_MS : 1;
      const pop = 0.85 + 0.15 * EASE(clamp(age / TUNE.TIP_POP_MS, 0, 1));
      ctx.save();
      ctx.font = `700 14px ${sans}`;
      const w = Math.ceil(ctx.measureText(tip.text).width) + 28, h = 36;
      const bx = clamp(pos.x - w / 2, 16, vw - 16 - w);
      const below = pos.y - R - 18 - h < 100;
      const by = below ? pos.y + R + 18 : pos.y - R - 18 - h;
      const tx = clamp(pos.x, bx + 18, bx + w - 18);
      const ty = below ? by - 8 : by + h + 8;
      ctx.translate(tx, ty);
      ctx.scale(pop, pop);
      ctx.translate(-tx, -ty);
      ctx.globalAlpha = fade * clamp(age / (TUNE.TIP_POP_MS * 0.6), 0, 1);
      ctx.shadowColor = "rgba(21,22,18,0.22)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = dark ? "#F8F9F3" : INK;
      rr(ctx, bx, by, w, h, 12);
      ctx.fill();
      ctx.beginPath();
      if (below) {
        ctx.moveTo(tx - 7, by);
        ctx.lineTo(tx, by - 8);
        ctx.lineTo(tx + 7, by);
      } else {
        ctx.moveTo(tx - 7, by + h);
        ctx.lineTo(tx, by + h + 8);
        ctx.lineTo(tx + 7, by + h);
      }
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = dark ? INK : "#FFFFFF";
      const base = ctx.globalAlpha;
      let cx = bx + 14;
      for (let i = 0; i < shown; i++) {
        const k = shown - 1 - i; // 0 = newest letter
        ctx.globalAlpha = base * (k < 4 && shown < n ? 0.3 + k * 0.175 : 1);
        ctx.fillText(tip.text[i], cx, by + 23);
        cx += ctx.measureText(tip.text[i]).width;
      }
      ctx.restore();
    };

    const drawCursor = (open: boolean, R: number, dt: number) => {
      if (!mouse || inModal || !pos) return;
      cursor.x += (mouse.x - cursor.x) * 0.35;
      cursor.y += (mouse.y - cursor.y) * 0.35;
      const talk = !open && Math.hypot(mouse.x - pos.x, mouse.y - pos.y) < R + TUNE.NEAR_PX * 0.6;
      // dot by default; a hollow ring over [CURSOR_RING] targets; a capsule with
      // text over the agent ("talk") and over anything with [data-cursor-label]
      const label = open ? null : talk ? "TALK" : hoverLabel;
      const ring = !open && !label && hoverRing;
      ctx.save();
      ctx.font = `400 15px ${sans}`;
      ctx.letterSpacing = TUNE.CURSOR_LABEL_SPACING;
      const T = label ? [Math.ceil(ctx.measureText(label).width) + 36, 38] : ring ? [TUNE.CURSOR_RING_PX, TUNE.CURSOR_RING_PX] : [TUNE.CURSOR_DOT_PX, TUNE.CURSOR_DOT_PX];
      const k = 1 - Math.exp(-dt / (TUNE.CURSOR_MS / 3));
      cursor.w += (T[0] - cursor.w) * k;
      cursor.h += (T[1] - cursor.h) * k;
      cursor.fill += ((ring ? 0 : 1) - cursor.fill) * k;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // a white shape with an ink border; the hollow ring swaps the fill for a thin
      // white line inside the border, so it still shows on dark ground
      rr(ctx, cursor.x - cursor.w / 2, cursor.y - cursor.h / 2, cursor.w, cursor.h, cursor.h / 2);
      ctx.fillStyle = CURSOR_FILL;
      ctx.globalAlpha = cursor.fill;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = CURSOR_INK;
      ctx.lineWidth = TUNE.CURSOR_BORDER_PX;
      ctx.stroke();
      if (cursor.fill < 0.99) {
        const i = TUNE.CURSOR_BORDER_PX;
        rr(ctx, cursor.x - cursor.w / 2 + i, cursor.y - cursor.h / 2 + i, cursor.w - i * 2, cursor.h - i * 2, cursor.h / 2 - i);
        ctx.strokeStyle = CURSOR_FILL;
        ctx.globalAlpha = 1 - cursor.fill;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (label && cursor.w > T[0] * 0.8) {
        ctx.fillStyle = CURSOR_INK;
        ctx.fillText(label, cursor.x, cursor.y + 0.5);
      }
      ctx.restore();
    };

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - (lastT || now));
      const step = clamp(dt / 1000, 0.001, 0.05); // seconds, for the springs
      lastT = now;
      const open = chatOpenRef.current;

      const { sec, rect, el } = locate(vh * TUNE.ACTIVE_LINE);
      if (!open && secId !== sec.id) {
        if (secId) say(sec.line, true);
        secId = sec.id;
      }
      // chat open: sit in the dialog's top-right seat, where a close button would be
      const seat = open ? document.querySelector("[data-agent-seat]")?.getBoundingClientRect() : null;
      const chatSpot: Spot = seat
        ? { x: (seat.left + seat.width / 2) / vw, y: (seat.top + seat.height / 2) / vh, screen: true, size: seat.width / ss }
        : { x: 0.5, y: 0.5, screen: true, size: TUNE.SIZE_SMALL };
      const spot = open ? chatSpot : sec;
      const target = restingSpot(spot, rect, !open && el ? stopIn(el, vh * TUNE.ACTIVE_LINE) : null);
      const targetSize = spot.size * ss;
      if (spot.drift) {
        target.x += Math.sin(now * TUNE.DRIFT_X_RATE) * TUNE.DRIFT_X;
        target.y += Math.cos(now * TUNE.DRIFT_Y_RATE) * TUNE.DRIFT_Y;
      }
      if (mouse && !open && pos) {
        const dx = mouse.x - pos.x, dy = mouse.y - pos.y;
        const d = Math.hypot(dx, dy);
        if (d > 1 && d < TUNE.LEAN_RANGE) {
          target.x += (dx / d) * TUNE.LEAN_X;
          target.y += (dy / d) * TUNE.LEAN_Y;
        }
      }

      if (!pos) {
        pos = target;
        size = targetSize;
      } else {
        vel.x += (TUNE.SPRING_K * (target.x - pos.x) - TUNE.SPRING_DAMP * vel.x) * step;
        vel.y += (TUNE.SPRING_K * (target.y - pos.y) - TUNE.SPRING_DAMP * vel.y) * step;
        const speed = Math.hypot(vel.x, vel.y);
        if (speed > TUNE.MAX_SPEED) {
          vel.x *= TUNE.MAX_SPEED / speed;
          vel.y *= TUNE.MAX_SPEED / speed;
        }
        pos.x += vel.x * step;
        pos.y += vel.y * step;
        sizeVel += (TUNE.SIZE_K * (targetSize - size) - TUNE.SIZE_DAMP * sizeVel) * step;
        size = Math.max(1, size + sizeVel * step);
      }
      const R = size / 2;

      if (mouse && !open) {
        const d = Math.hypot(mouse.x - pos.x, mouse.y - pos.y);
        const near = d < R + TUNE.NEAR_PX;
        if (near && !wasNear) say(NEAR_LINES[Math.floor(Math.random() * NEAR_LINES.length)]);
        wasNear = near;
        if (d < R + 10 && now - restSince > TUNE.REST_MS) {
          say(REST_LINES[Math.floor(Math.random() * REST_LINES.length)]);
          restSince = now + 1e9;
        }
      }

      const dark = open || locate(clamp(pos.y, 0, vh - 1)).sec.dark;
      const look = mouse ?? { x: pos.x, y: pos.y + 40 };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      drawAgent(pos.x, pos.y, R, dark, look, blinkAmount(now), now);
      drawTip(now, dark, R);
      drawCursor(open, R, dt);

      const btn = btnRef.current;
      if (btn) {
        btn.style.width = btn.style.height = size + "px";
        btn.style.transform = `translate(${pos.x - size / 2}px, ${pos.y - size / 2}px)`;
      }
    };
    raf = requestAnimationFrame(frame);

    const onMove = (e: MouseEvent) => {
      const m = { x: e.clientX, y: e.clientY };
      if (!mouse || Math.hypot(m.x - mouse.x, m.y - mouse.y) > 3) restSince = performance.now();
      mouse = m;
      const t = e.target instanceof Element ? e.target : null;
      hoverLabel = t?.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? null;
      hoverRing = !!t?.closest(CURSOR_RING);
      // dialogs and text fields keep the real cursor
      inModal = !!t?.closest('[aria-modal="true"], textarea, input');
    };
    const onLeave = () => {
      mouse = null;
    };
    addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("agent-cursor");
    };
  }, [enabled]);

  return (
    <>
      {/* the chat works without the agent too (touch, small screens, reduced motion); it just gets a plain close button */}
      {chatOpen ? <AgentChat start={chat} closeButton={!enabled} onClose={closeChat} /> : null}
      {enabled ? (
        <>
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-screen w-screen" />
          <button
            ref={btnRef}
            type="button"
            aria-label={chatOpen ? "Close the chat" : "Talk to the site agent"}
            onClick={() => setChat((v) => (v ? false : "menu"))}
            className="fixed top-0 left-0 z-[71] rounded-full bg-transparent p-0"
          />
        </>
      ) : null}
    </>
  );
}
