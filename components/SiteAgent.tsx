"use client";

import Lenis from "lenis";
import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTACT } from "@/lib/content";
import { LINKS, TOPICS, type Action, type Topic } from "@/lib/agentTopics";

/*
 * The site agent: a fuzzy dot sphere with eyes that rides the page, springs to a
 * new spot as sections change, talks in little typed bubbles, and opens a chat.
 * Everything is drawn on one fixed canvas. Each section owns one resting spot;
 * every frame the agent chases that spot with a damped spring. Desktop pointers only.
 */

// ---- Tunables (px on the 1440 x 900 design frame, ms for time) ---------------
const TUNE = {
  BLINK_HALF_MS: 130, // a blink closes for this long, then opens for as long: linear, no easing
  BLINK_FIRST_MS: 4000, // the first one, after the eyes appear
  BLINK_GAP_MS: 2600, // then this long between blinks...
  BLINK_GAP_RAND_MS: 3600, // ...plus up to this much, at random
  DOUBLE_BLINK_CHANCE: 0.25, // this often a blink is followed straight away by a second one...
  DOUBLE_BLINK_GAP_MS: 90, // ...after the eyes have been open this long
  BLINK_MIN_OPEN: 0.12, // the eye squashes down to this share of its height; below it, a closed-lid line
  BLINK_LINE_PX: 2.2,
  BLINK_LINE_SPAN: 0.9, // the closed lid reaches this share of the eye radius either side
  DIZZY_MOUSE_SPEED: 3500, // px/s: the pointer moving faster than this...
  DIZZY_SCROLL_SPEED: 5000, // ...or the page scrolling faster than this...
  DIZZY_HOLD_MS: 300, // ...for about this long makes the agent dizzy
  DIZZY_MS: 2600, // how long the spiral eyes last
  DIZZY_COOLDOWN_MS: 6000, // and the rest before it can happen again
  DIZZY_SPIN: 0.012, // rad/ms, about 1.9 turns a second
  DIZZY_TURNS: 2.5, // coils in each spiral
  BLINK_PUPIL_HOLD: 0.2, // the pupil's height is steadied against the squash down to this openness
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
  NEAR_CHANCE: 0.4, // how often coming close gets a line at all, once the cooldown has passed
  REST_CHANCE: 0.5, // and how often lingering on the agent does
  CURSOR_MS: 300,
  CURSOR_DOT_PX: 16,
  CURSOR_RING_PX: 44,
  CURSOR_BORDER_PX: 2,
  CURSOR_BAR_W: 1, // the typing bar over text fields, before its border
  CURSOR_BAR_H: 24,
  CURSOR_LABEL_SPACING: "0.6px",
  TIP_SPACING: "0.4px",
};
const ACCENT = "#FFF714";
const INK = "#1D1E19";
// the agent's seat in the chat header: its hero size, which scales with the viewport like `ss` does
const SEAT_SIZE = `clamp(${TUNE.SIZE_SMALL * 0.75}px, ${(TUNE.SIZE_SMALL / 1440) * 100}vw, ${TUNE.SIZE_SMALL * 1.25}px)`;
const CURSOR_INK = "#0E0E0C";
const CURSOR_FILL = "#F8F9F3"; // the page background
// The cursor is one solid colour, CURSOR_INK or CURSOR_FILL: whichever contrasts more with
// what is under it. The ground is re-read this often (ms), and the colour eases over.
const CURSOR_GROUND_MS = 80;
const CURSOR_TONE_MS = 160;
const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const CURSOR_RGB = { ink: hexRgb(CURSOR_INK), fill: hexRgb(CURSOR_FILL) };
/** WCAG relative luminance of an 8-bit sRGB colour, 0 (black) to 1 (white). */
const luminance = (r: number, g: number, b: number) => {
  const lin = (v: number) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
/** The ground luminance at which two colours contrast equally with it: below it the lighter one wins, above it the darker. */
const flipAt = (a: number[], b: number[]) => Math.sqrt((luminance(a[0], a[1], a[2]) + 0.05) * (luminance(b[0], b[1], b[2]) + 0.05)) - 0.05;
const mixRgb = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const CURSOR_FLIP_AT = flipAt(CURSOR_RGB.ink, CURSOR_RGB.fill);
// The agent's body is ink, and accent in sections marked `dark` (and in the chat); it eases between the two.
const AGENT_RGB = { ink: hexRgb(INK), accent: hexRgb(ACCENT) };
const AGENT_TONE_MS = 220;
// hovering these turns the cursor into a hollow ring
const CURSOR_RING = 'header a, footer a, #craft a[href*="calendly.com"], [aria-haspopup="dialog"]';

// x, y are fractions of the section's box, or of the viewport when `screen` is set
type Spot = { x: number; y: number; size: number; screen?: boolean; drift?: boolean };
type Section = Spot & { id: string; line: string; dark?: boolean };

// Matched to the [data-section] ids on the page.
const SECTIONS: Section[] = [
  { id: "hero", line: "Hi. I live here.", x: 0.95, y: 0.21, screen: true, size: TUNE.SIZE_SMALL },
  { id: "work", line: "Products with actual users.", x: 0.2, y: 0.42, size: TUNE.SIZE_WORK },
  { id: "craft", line: "Scroll this slowly.", x: 0.8, y: 0.44, size: TUNE.SIZE_DEFAULT },
  { id: "testimonials", line: "All Verified Feedback.", x: 0.1, y: 0.52, size: TUNE.SIZE_DEFAULT },
  { id: "contact", line: "Go on, press it.", x: 0.82, y: 0.6, size: TUNE.SIZE_HUGE, drift: true },
  // sits high, in the empty top-right of the footer, clear of the wordmark
  { id: "footer", dark: true, line: "The end!", x: 0.9, y: 0.3, size: TUNE.SIZE_DEFAULT },
];

const NEAR_LINES = ["Oh, hello.", "Did you know I talked?", "I’m observing.", "Click me. I won’t bite.", "Personal space. Kidding."];
const DIZZY_LINES = ["Please move slower.", "Whoa. Slow down.", "Too fast. I’m dizzy.", "Easy. I get motion sick.", "Everything is spinning."];
const REST_LINES = ["Still there? Click me.", "Staring contest. You lose.", "I can do this all day."];
// Lines said once per page load: every section's line, plus any other line listed here
// (from NEAR_LINES or REST_LINES). The text must match the line exactly.
const ONCE_LINES = new Set<string>([...SECTIONS.map((s) => s.line)]);
const saidOnce = new Set<string>(); // lives until the page reloads

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
  "Hey, I’m a resident here. Ask me anything about Shahzaib from the options below and I will answer honestly.",
  "Oh good, a visitor. I know a lot about Shahzaib so ask me anything about him using the buttons below.",
  "Hi. Noticed you scrolling around before. Would you like to know anything about Shahzaib?\n\nUse the buttons below to ask me questions.",
  "Congratulations on clicking me. Let’s talk about Shahzaib since this is his portfolio.\n\nAsk me anything from the options below.",
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

// The chat's live marker morphs between these outlines. Each is a polygon in a 0..1 box
// (null is the circle), resampled to the same number of points so one can ease into another.
const MARKER_SHAPES: ([number, number][] | null)[] = [
  null,
  [[0.07, 0.07], [0.93, 0.07], [0.93, 0.93], [0.07, 0.93]], // square
  [[0.5, 0.04], [1, 0.92], [0, 0.92]], // triangle
  [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]], // diamond
  [[0.33, 0], [0.67, 0], [0.67, 0.33], [1, 0.33], [1, 0.67], [0.67, 0.67], [0.67, 1], [0.33, 1], [0.33, 0.67], [0, 0.67], [0, 0.33], [0.33, 0.33]], // plus
];
const MARKER = { POINTS: 72, EVERY_MS: 1500, MORPH_MS: 800, EASE: "cubic-bezier(0.65, 0, 0.35, 1)" };

/** A shape's outline as a clip-path: rays cast from the centre, one per point. */
function markerOutline(verts: [number, number][] | null) {
  const pts: string[] = [];
  for (let i = 0; i < MARKER.POINTS; i++) {
    const th = (i / MARKER.POINTS) * Math.PI * 2 - Math.PI / 2;
    const dx = Math.cos(th), dy = Math.sin(th);
    let r = verts ? 0 : 0.5;
    verts?.forEach(([ax, ay], j) => {
      const [bx, by] = verts[(j + 1) % verts.length];
      const ex = bx - ax, ey = by - ay;
      const den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) return;
      const t = ((ax - 0.5) * ey - (ay - 0.5) * ex) / den;
      const u = ((ax - 0.5) * dy - (ay - 0.5) * dx) / den;
      if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9) r = Math.max(r, t);
    });
    pts.push(`${((0.5 + dx * r) * 100).toFixed(2)}% ${((0.5 + dy * r) * 100).toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")})`;
}
const MARKER_OUTLINES = MARKER_SHAPES.map(markerOutline);

/** The yellow marker in the chat header: it keeps turning into another shape, never the same one twice running. */
function LiveMarker() {
  const [step, setStep] = useState({ shape: 0, turns: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setStep((prev) => {
        // pick among the other shapes, so the next one always differs
        const next = (prev.shape + 1 + Math.floor(Math.random() * (MARKER_OUTLINES.length - 1))) % MARKER_OUTLINES.length;
        return { shape: next, turns: prev.turns + 1 };
      });
    }, MARKER.EVERY_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="size-2.5 bg-accent"
      style={{
        clipPath: MARKER_OUTLINES[step.shape],
        transform: `rotate(${step.turns * 360}deg)`,
        transition: `clip-path ${MARKER.MORPH_MS}ms ${MARKER.EASE}, transform ${MARKER.MORPH_MS}ms ${MARKER.EASE}`,
      }}
    />
  );
}

const FIELD =
  "w-full border border-on-ink/20 bg-on-ink/5 px-3.5 py-3 text-[15px] leading-[22px] tracking-normal text-background outline-none transition-colors duration-150 placeholder:text-on-ink/45 focus:border-on-ink/60";
const ACTION =
  "rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold tracking-normal text-black transition-opacity duration-150 hover:opacity-85";

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
  // the questions opened so far, outermost first; the last one's follow-ups are the menu on show
  const [path, setPath] = useState<Topic[]>([]);
  const topic = path.at(-1) ?? null;
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
    setPath((prev) => (t.more ? [...prev, t] : []));
    setBusy(true);
    const actions = t.actions?.filter((x) => x !== "form");
    if (t.actions?.includes("form")) {
      // "form" starts a fresh run of the idea form under this answer
      setIdeas((prev) => [...prev, NEW_IDEA]);
      typeOut(t.a, { actions, field: { run: ideas.length, kind: "idea" } });
    } else typeOut(t.a, { actions });
  };
  const back = () => setPath((prev) => prev.slice(0, -1));
  const toMenu = () => setPath([]);

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
  const chip = "agent-in rounded-full border px-3.5 py-2 text-sm tracking-normal transition-colors duration-150";

  return (
    <div
      className="agent-fade fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(21,22,18,0.35)] backdrop-blur-[8px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-lenis-prevent
    >
      <div
        role="dialog"
        aria-label="Chat Session"
        className="flex h-[min(560px,calc(100dvh-32px))] w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden border border-accent bg-ink text-background shadow-[0_30px_80px_rgba(21,22,18,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-on-ink/12 px-[22px] py-2.5">
          <span className="flex items-center gap-2.5 text-[12px] tracking-[0.08em] text-on-ink/80 uppercase">
            <LiveMarker />
            Session with the site mascot
          </span>
          {closeButton ? (
            <button
              type="button"
              onClick={onClose}
              className="my-2 rounded-full border border-on-ink/20 px-3.5 py-2 text-sm tracking-normal text-on-ink/80 transition-colors duration-150 hover:border-accent hover:text-accent"
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
                  className={`agent-in whitespace-pre-line px-4 py-3 text-[15px] leading-[22px] tracking-normal ${
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
          key={`${path.length}-${topic?.q ?? "menu"}-${busy}`}
          className={`flex flex-wrap gap-2 border-t border-on-ink/12 px-[22px] pt-4 pb-[22px] ${busy ? "pointer-events-none invisible" : ""}`}
        >
          {options.map((t, i) => (
            <button
              key={t.q}
              type="button"
              onClick={() => ask(t)}
              className={`${chip} border-on-ink/25 text-background hover:border-accent hover:text-accent`}
              style={{ animationDelay: `${i * CHAT.CHIP_STAGGER}ms` }}
            >
              {t.q}
            </button>
          ))}
          {/* one level up; from deeper than that, also straight back to the primary questions */}
          {[
            ...(path.length > 1 ? [{ label: "← Back", go: back }] : []),
            ...(path.length ? [{ label: path.length > 1 ? "Back to menu" : "← Back to menu", go: toMenu }] : []),
          ].map((b, i) => (
            <button
              key={b.label}
              type="button"
              onClick={b.go}
              className={`${chip} border-transparent bg-on-ink/10 text-on-ink/80 hover:border-accent hover:text-accent`}
              style={{ animationDelay: `${(options.length + i) * CHAT.CHIP_STAGGER}ms` }}
            >
              {b.label}
            </button>
          ))}
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
    let blinkAt = performance.now() + TUNE.BLINK_FIRST_MS; // the moment the eyes are fully shut
    let blinkAgain = Math.random() < TUNE.DOUBLE_BLINK_CHANCE;
    const cursor = { x: vw / 2, y: vh / 2, w: TUNE.CURSOR_DOT_PX, h: TUNE.CURSOR_DOT_PX, fill: 1, tone: 0 }; // tone: 0 dark cursor, 1 light
    let mouse: { x: number; y: number } | null = null;
    let hoverLabel: string | null = null, hoverRing = false, inModal = false, inText = false, onDark = false, groundAt = 0;
    let agentTone = 0; // 0 ink body, 1 accent body
    let dizzyUntil = 0, dizzyMeter = 0, mouseTravel = 0, lastScrollY = scrollY;

    const say = (text: string, force = false) => {
      if (saidOnce.has(text)) return;
      const now = performance.now();
      if (!force && now - lastTipAt < TUNE.TIP_COOLDOWN_MS) return;
      tip = { text, start: now };
      lastTipAt = now;
      if (ONCE_LINES.has(text)) saidOnce.add(text);
    };

    /** How open the eyes are, 1 to 0 and back: a triangle wave around blinkAt. */
    const eyeOpenness = (now: number) => {
      if (now > blinkAt + TUNE.BLINK_HALF_MS) {
        if (blinkAgain) {
          blinkAgain = false;
          blinkAt = now + TUNE.DOUBLE_BLINK_GAP_MS + TUNE.BLINK_HALF_MS;
        } else {
          blinkAt = now + TUNE.BLINK_GAP_MS + Math.random() * TUNE.BLINK_GAP_RAND_MS;
          blinkAgain = Math.random() < TUNE.DOUBLE_BLINK_CHANCE;
        }
      }
      const d = Math.abs(blinkAt - now);
      return d < TUNE.BLINK_HALF_MS ? d / TUNE.BLINK_HALF_MS : 1;
    };

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

    const drawAgent = (x: number, y: number, R: number, dark: boolean, body: string, look: { x: number; y: number }, openness: number, dizzy: boolean, t: number) => {
      const huge = R * 2 >= TUNE.HUGE_FROM * ss;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = body;
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
      ctx.fillStyle = body;
      ctx.beginPath();
      if (huge) ctx.ellipse(0, 0.2 * R, 0.2 * R, 0.15 * R, 0, 0, 6.283);
      else ctx.arc(0, 0.2 * R, (TUNE.NOSE_PX * ss) / 2, 0, 6.283);
      ctx.fill();

      const gap = 0.34 * R, er = 0.26 * R, pr = er * 0.52;
      for (const side of [-1, 1]) {
        const ex = side * gap, ey = -0.06 * R;
        ctx.save();
        ctx.translate(ex, ey);
        if (openness < TUNE.BLINK_MIN_OPEN) {
          // shut: the eye is just its lid, a short line in the eye's own white
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = TUNE.BLINK_LINE_PX;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-er * TUNE.BLINK_LINE_SPAN, 0);
          ctx.lineTo(er * TUNE.BLINK_LINE_SPAN, 0);
          ctx.stroke();
          ctx.restore();
          continue;
        }
        // a blink squashes the whole eye vertically about its centre
        ctx.scale(1, openness);
        ctx.beginPath();
        ctx.arc(0, 0, er, 0, 6.283);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        if (!dark) {
          ctx.strokeStyle = "rgba(29,30,25,0.85)";
          ctx.lineWidth = Math.max(0.6, R * 0.03);
          ctx.stroke();
        }
        ctx.clip();
        if (dizzy) {
          // dizzy: the pupil gives way to a spinning spiral (radius grows evenly with the angle), the two eyes turning opposite ways
          const coil = TUNE.DIZZY_TURNS * 6.283, spin = t * TUNE.DIZZY_SPIN;
          ctx.strokeStyle = INK;
          ctx.lineWidth = Math.max(1, er * 0.13);
          ctx.lineCap = "round";
          ctx.beginPath();
          for (let a = 0; a <= coil; a += 0.2) {
            const r = (a / coil) * er * 0.82, at = (a + spin) * side;
            ctx.lineTo(Math.cos(at) * r, Math.sin(at) * r);
          }
          ctx.stroke();
        } else {
          const dx = look.x - (x + ex), dy = look.y - (y + ey);
          const d = Math.hypot(dx, dy) || 1;
          const m = Math.min(1, d / 120) * (er - pr - 0.6);
          ctx.fillStyle = INK;
          ctx.beginPath();
          // the pupil squashes with the eye, but its height offset is divided back so it does not sink to the middle
          ctx.arc((dx / d) * m, ((dy / d) * m) / Math.max(TUNE.BLINK_PUPIL_HOLD, openness), pr, 0, 6.283);
          ctx.fill();
        }
        // the huge state rests with its lids half down
        if (huge) {
          ctx.fillStyle = INK;
          ctx.fillRect(-er, -er, er * 2, er * 2 * TUNE.HUGE_LID);
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
      ctx.font = `400 14px ${sans}`;
      ctx.letterSpacing = TUNE.TIP_SPACING;
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

    // a 1px scratch canvas: reads any CSS colour string, or one pixel of an image or video frame
    const probe = document.createElement("canvas");
    probe.width = probe.height = 1;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    const cssColors = new Map<string, Uint8ClampedArray>();
    const cssColor = (value: string) => {
      let c = cssColors.get(value);
      if (!c && pctx) {
        pctx.clearRect(0, 0, 1, 1);
        pctx.fillStyle = value;
        pctx.fillRect(0, 0, 1, 1);
        c = pctx.getImageData(0, 0, 1, 1).data;
        cssColors.set(value, c);
      }
      return c;
    };
    /** How bright the page is at this point, 0 to 1. Walks down the stack to the first thing that paints there. */
    const groundLuminance = (x: number, y: number) => {
      if (!pctx) return 1;
      for (const el of document.elementsFromPoint(x, y)) {
        if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement) {
          const video = el instanceof HTMLVideoElement;
          const nw = video ? el.videoWidth : el.naturalWidth, nh = video ? el.videoHeight : el.naturalHeight;
          if (!nw || !nh) continue;
          // media here is object-cover: scaled to fill its box and centred
          const r = el.getBoundingClientRect();
          const scale = Math.max(r.width / nw, r.height / nh);
          const sx = (x - r.left - (r.width - nw * scale) / 2) / scale;
          const sy = (y - r.top - (r.height - nh * scale) / 2) / scale;
          try {
            pctx.clearRect(0, 0, 1, 1);
            pctx.drawImage(el, clamp(sx, 0, nw - 1), clamp(sy, 0, nh - 1), 1, 1, 0, 0, 1, 1);
            const d = pctx.getImageData(0, 0, 1, 1).data;
            if (d[3] > 127) return luminance(d[0], d[1], d[2]);
          } catch {
            // a cross-origin image cannot be read; fall through to what is behind it
          }
          continue;
        }
        const c = cssColor(getComputedStyle(el).backgroundColor);
        // mostly see-through layers (the chat's dimmed backdrop, faint tints) do not count as ground
        if (c && c[3] > 127) return luminance(c[0], c[1], c[2]);
      }
      return 1;
    };

    const drawCursor = (open: boolean, R: number, dt: number) => {
      if (!mouse || !pos) return;
      if (inModal) {
        // not drawn here, but kept under the pointer so it never flies in from where it last was
        cursor.x = mouse.x;
        cursor.y = mouse.y;
        return;
      }
      const at = performance.now();
      if (at - groundAt > CURSOR_GROUND_MS) {
        groundAt = at;
        onDark = groundLuminance(mouse.x, mouse.y) < CURSOR_FLIP_AT;
      }
      cursor.tone += ((onDark ? 1 : 0) - cursor.tone) * (1 - Math.exp(-dt / (CURSOR_TONE_MS / 3)));
      cursor.x += (mouse.x - cursor.x) * 0.35;
      cursor.y += (mouse.y - cursor.y) * 0.35;
      const talk = !open && Math.hypot(mouse.x - pos.x, mouse.y - pos.y) < R + TUNE.NEAR_PX * 0.6;
      // dot by default; a hollow ring over [CURSOR_RING] targets; a capsule with
      // text over the agent ("talk") and over anything with [data-cursor-label];
      // a thin upright bar over text fields
      const label = open || inText ? null : talk ? "TALK" : hoverLabel;
      const ring = !open && !inText && !label && hoverRing;
      ctx.save();
      ctx.font = `400 15px ${sans}`;
      ctx.letterSpacing = TUNE.CURSOR_LABEL_SPACING;
      const T = label ? [Math.ceil(ctx.measureText(label).width) + 36, 38] : ring ? [TUNE.CURSOR_RING_PX, TUNE.CURSOR_RING_PX] : inText ? [TUNE.CURSOR_BAR_W, TUNE.CURSOR_BAR_H] : [TUNE.CURSOR_DOT_PX, TUNE.CURSOR_DOT_PX];
      const k = 1 - Math.exp(-dt / (TUNE.CURSOR_MS / 3));
      cursor.w += (T[0] - cursor.w) * k;
      cursor.h += (T[1] - cursor.h) * k;
      cursor.fill += ((ring ? 0 : 1) - cursor.fill) * k;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // one solid colour, picked against the ground; the hollow ring keeps only the outline
      const mix = (t: number) => mixRgb(CURSOR_RGB.ink, CURSOR_RGB.fill, t);
      const ink = mix(cursor.tone);
      rr(ctx, cursor.x - cursor.w / 2, cursor.y - cursor.h / 2, cursor.w, cursor.h, Math.min(cursor.w, cursor.h) / 2);
      ctx.fillStyle = ink;
      ctx.globalAlpha = cursor.fill;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = ink;
      ctx.lineWidth = TUNE.CURSOR_BORDER_PX;
      ctx.stroke();
      if (label && cursor.w > T[0] * 0.8) {
        ctx.fillStyle = mix(1 - cursor.tone);
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

      // moving the pointer or the page too fast for a moment makes the agent dizzy
      const mouseSpeed = dt > 0 ? (mouseTravel / dt) * 1000 : 0;
      const scrollSpeed = dt > 0 ? (Math.abs(scrollY - lastScrollY) / dt) * 1000 : 0;
      mouseTravel = 0;
      lastScrollY = scrollY;
      const rushing = mouseSpeed > TUNE.DIZZY_MOUSE_SPEED || scrollSpeed > TUNE.DIZZY_SCROLL_SPEED;
      // fills while rushing and drains at half the pace, so a shake's brief reversals still add up
      dizzyMeter = clamp(dizzyMeter + (rushing ? dt : -dt / 2), 0, TUNE.DIZZY_HOLD_MS);
      if (!open && dizzyMeter >= TUNE.DIZZY_HOLD_MS && now > dizzyUntil + TUNE.DIZZY_COOLDOWN_MS) {
        dizzyUntil = now + TUNE.DIZZY_MS;
        dizzyMeter = 0;
        say(DIZZY_LINES[Math.floor(Math.random() * DIZZY_LINES.length)], true);
      }
      const dizzy = now < dizzyUntil;

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
        if (near && !wasNear && Math.random() < TUNE.NEAR_CHANCE) say(NEAR_LINES[Math.floor(Math.random() * NEAR_LINES.length)]);
        wasNear = near;
        if (d < R + 10 && now - restSince > TUNE.REST_MS) {
          if (Math.random() < TUNE.REST_CHANCE) say(REST_LINES[Math.floor(Math.random() * REST_LINES.length)]);
          restSince = now + 1e9;
        }
      }

      const agentDark = open || !!locate(clamp(pos.y, 0, vh - 1)).sec.dark;
      agentTone += ((agentDark ? 1 : 0) - agentTone) * (1 - Math.exp(-dt / (AGENT_TONE_MS / 3)));
      const dark = agentTone > 0.5;
      const look = mouse ?? { x: pos.x, y: pos.y + 40 };

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      drawAgent(pos.x, pos.y, R, dark, mixRgb(AGENT_RGB.ink, AGENT_RGB.accent, agentTone), look, dizzy ? 1 : eyeOpenness(now), dizzy, now);
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
      if (mouse) mouseTravel += Math.hypot(m.x - mouse.x, m.y - mouse.y);
      mouse = m;
      const t = e.target instanceof Element ? e.target : null;
      hoverLabel = t?.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? null;
      hoverRing = !!t?.closest(CURSOR_RING);
      inText = !!t?.closest("textarea, input");
      // dialogs keep the real cursor
      inModal = !inText && !!t?.closest('[aria-modal="true"]');
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
