"use client";

/**
 * Behaviour tracking for the portfolio site.
 *
 * Writes to two Supabase tables, `analytics_sessions` (one row per visit) and
 * `analytics_events` (one row per action). The browser holds an insert-only
 * key, so nothing here can read the data back.
 *
 * Everything is captured by delegation from `startAnalytics()`, so components
 * stay clean. Two optional attributes steer it:
 *   data-track="..."        a stable name for a clickable thing
 *   data-track-event="..."  override the event_type for that click
 *   data-section="..."      marks a section for view and dwell tracking
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const VISITOR_KEY = "sa_visitor_id";
const SESSION_KEY = "sa_session_id";

const FLUSH_EVERY_MS = 5000;
const FLUSH_AT_COUNT = 20;
const MAX_BATCH = 40;
const SCROLL_MARKS = [25, 50, 75, 90, 100];
const SCROLL_THROTTLE_MS = 200;
const RAGE_WINDOW_MS = 700;
const RAGE_RADIUS_PX = 32;
const RAGE_CLICKS = 3;

const BOT =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|scrape|curl|wget|python-requests|axios|node-fetch/i;

type Props = Record<string, unknown>;

type QueuedEvent = {
  session_id: string;
  visitor_id: string;
  event_type: string;
  target: string | null;
  section: string | null;
  path: string;
  value: number | null;
  occurred_at: string;
  props: Props;
};

let sessionId = "";
let visitorId = "";
let live = false;
let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      Number(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
    ).toString(16),
  );
}

/** localStorage and sessionStorage both throw outright when site data is blocked. */
function store(kind: "local" | "session", key: string): string | null {
  try {
    return (kind === "local" ? localStorage : sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

function remember(kind: "local" | "session", key: string, value: string) {
  try {
    (kind === "local" ? localStorage : sessionStorage).setItem(key, value);
  } catch {
    /* private mode, ignore */
  }
}

async function post(table: string, rows: unknown[]) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: SUPABASE_KEY as string,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(rows),
    });
  } catch {
    /* never let tracking break the page */
  }
}

function flush() {
  if (!queue.length) return;
  const batch = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);
  void post("analytics_events", batch);
}

/** Queue one event. Safe to call before or after start, and on a dead session. */
export function track(event_type: string, options: {
  target?: string | null;
  section?: string | null;
  value?: number | null;
  props?: Props;
} = {}) {
  if (!live) return;
  queue.push({
    session_id: sessionId,
    visitor_id: visitorId,
    event_type,
    target: options.target?.slice(0, 256) ?? null,
    section: options.section ?? null,
    path: location.pathname,
    value: options.value ?? null,
    occurred_at: new Date().toISOString(),
    props: options.props ?? {},
  });
  if (queue.length >= FLUSH_AT_COUNT) flush();
}

function browserOf(ua: string) {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function osOf(ua: string) {
  if (/Windows/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

function deviceOf(ua: string) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/.test(ua)) return "mobile";
  return "desktop";
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function sessionRow(isReturning: boolean) {
  const ua = navigator.userAgent;
  const params = new URLSearchParams(location.search);
  const referrer = document.referrer || null;
  return {
    id: sessionId,
    visitor_id: visitorId,
    landing_path: location.pathname + location.search,
    referrer: referrer?.slice(0, 1024) ?? null,
    referrer_host: referrer ? hostOf(referrer) : null,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
    user_agent: ua.slice(0, 512),
    device_type: deviceOf(ua),
    browser: browserOf(ua),
    os: osOf(ua),
    screen_w: screen.width,
    screen_h: screen.height,
    viewport_w: innerWidth,
    viewport_h: innerHeight,
    pixel_ratio: Math.round(devicePixelRatio * 100) / 100,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_returning: isReturning,
  };
}

function nameOf(el: Element) {
  const named = el.closest<HTMLElement>("[data-track]");
  if (named?.dataset.track) return named.dataset.track;
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 120);
  return el.getAttribute("aria-label") ?? el.tagName.toLowerCase();
}

function sectionOf(el: Element) {
  return el.closest<HTMLElement>("[data-section]")?.dataset.section ?? null;
}

/** Wire every listener. Returns the teardown. */
export function startAnalytics() {
  if (live || typeof window === "undefined") return () => {};
  if (!SUPABASE_URL || !SUPABASE_KEY) return () => {};
  if (BOT.test(navigator.userAgent) || navigator.webdriver) return () => {};

  const knownVisitor = store("local", VISITOR_KEY);
  visitorId = knownVisitor ?? uuid();
  if (!knownVisitor) remember("local", VISITOR_KEY, visitorId);

  const knownSession = store("session", SESSION_KEY);
  sessionId = knownSession ?? uuid();
  live = true;

  if (!knownSession) {
    remember("session", SESSION_KEY, sessionId);
    void post("analytics_sessions", [sessionRow(Boolean(knownVisitor))]);
  }

  const startedAt = Date.now();
  let deepest = 0;
  let hiddenAt = 0;
  let formStarted = false;
  let formSubmitted = false;
  const marked = new Set<number>();
  const seenSections = new Set<string>();
  const enteredAt = new Map<string, number>();
  let rage = { name: "", x: 0, y: 0, at: 0, count: 0 };
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;

  track("page_view", {
    props: {
      title: document.title,
      is_returning: Boolean(knownVisitor),
      reloaded_session: Boolean(knownSession),
    },
  });

  const readScroll = () => {
    scrollTimer = null;
    const height = document.documentElement.scrollHeight - innerHeight;
    const pct = height <= 0 ? 100 : Math.round((scrollY / height) * 100);
    const reached = Math.min(100, Math.max(0, pct));
    if (reached > deepest) deepest = reached;
    for (const mark of SCROLL_MARKS) {
      if (reached >= mark && !marked.has(mark)) {
        marked.add(mark);
        track("scroll_depth", { value: mark });
      }
    }
  };

  // setTimeout rather than requestAnimationFrame: rAF never runs in a
  // background tab, which would strand the throttle and lose the whole
  // session's scroll data for anyone who opens the site in one.
  const onScroll = () => {
    if (scrollTimer) return;
    scrollTimer = setTimeout(readScroll, SCROLL_THROTTLE_MS);
  };

  const onClick = (event: MouseEvent) => {
    const node = event.target as Element | null;
    if (!node) return;
    const hit = node.closest<HTMLElement>(
      "a, button, [role='button'], input[type='submit'], [data-track]",
    );
    if (!hit) return;

    const name = nameOf(hit);
    const section = sectionOf(hit);
    const href = hit.getAttribute("href");
    const outbound =
      !!href &&
      (/^(mailto:|tel:|wa\.me)/i.test(href) ||
        (/^https?:/i.test(href) && hostOf(href) !== location.host));

    track(hit.dataset.trackEvent ?? (outbound ? "outbound_click" : "click"), {
      target: name,
      section,
      props: {
        tag: hit.tagName.toLowerCase(),
        href: href ?? undefined,
        x: Math.round((event.clientX / innerWidth) * 100),
        y: Math.round((event.clientY / innerHeight) * 100),
      },
    });

    const now = Date.now();
    const close =
      rage.name === name &&
      now - rage.at < RAGE_WINDOW_MS &&
      Math.hypot(event.clientX - rage.x, event.clientY - rage.y) < RAGE_RADIUS_PX;
    rage = {
      name,
      x: event.clientX,
      y: event.clientY,
      at: now,
      count: close ? rage.count + 1 : 1,
    };
    if (rage.count >= RAGE_CLICKS) {
      track("rage_click", { target: name, section, value: rage.count });
      rage.count = 0;
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    const field = (event.target as Element | null)?.closest<HTMLElement>(
      "input, textarea, select",
    );
    if (!field) return;
    if (!formStarted) {
      formStarted = true;
      track("form_start", { target: field.getAttribute("name"), section: sectionOf(field) });
    }
  };

  const onFocusOut = (event: FocusEvent) => {
    const field = (event.target as Element | null)?.closest<
      HTMLInputElement | HTMLTextAreaElement
    >("input, textarea");
    if (!field) return;
    track("form_field", {
      target: field.getAttribute("name"),
      section: sectionOf(field),
      value: field.value.trim().length,
    });
  };

  const onSubmit = (event: SubmitEvent) => {
    formSubmitted = true;
    const form = event.target as HTMLElement;
    track("form_submit", { section: sectionOf(form) });
  };

  const onCopy = () => {
    const text = getSelection()?.toString().replace(/\s+/g, " ").trim() ?? "";
    track("copy", { target: text.slice(0, 120) || null, value: text.length });
  };

  const closeSections = () => {
    const now = Date.now();
    for (const [name, at] of enteredAt) {
      track("section_dwell", { section: name, value: now - at });
    }
    enteredAt.clear();
  };

  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      hiddenAt = Date.now();
      closeSections();
      track("tab_hide");
      flush();
    } else {
      track("tab_return", { value: hiddenAt ? Date.now() - hiddenAt : null });
    }
  };

  const onLeave = () => {
    closeSections();
    if (formStarted && !formSubmitted) track("form_abandon");
    track("session_end", {
      value: Date.now() - startedAt,
      props: { max_scroll: deepest, viewport_w: innerWidth, viewport_h: innerHeight },
    });
    flush();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const name = (entry.target as HTMLElement).dataset.section;
        if (!name) continue;
        if (entry.isIntersecting) {
          enteredAt.set(name, Date.now());
          if (!seenSections.has(name)) {
            seenSections.add(name);
            track("section_view", { section: name });
          }
        } else {
          const at = enteredAt.get(name);
          if (at) {
            enteredAt.delete(name);
            track("section_dwell", { section: name, value: Date.now() - at });
          }
        }
      }
    },
    { threshold: 0.35 },
  );
  document.querySelectorAll("[data-section]").forEach((el) => observer.observe(el));

  addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("click", onClick, true);
  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("focusout", onFocusOut, true);
  document.addEventListener("submit", onSubmit, true);
  document.addEventListener("copy", onCopy);
  document.addEventListener("visibilitychange", onVisibility);
  addEventListener("pagehide", onLeave);
  timer = setInterval(flush, FLUSH_EVERY_MS);
  readScroll();

  return () => {
    observer.disconnect();
    removeEventListener("scroll", onScroll);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("focusin", onFocusIn, true);
    document.removeEventListener("focusout", onFocusOut, true);
    document.removeEventListener("submit", onSubmit, true);
    document.removeEventListener("copy", onCopy);
    document.removeEventListener("visibilitychange", onVisibility);
    removeEventListener("pagehide", onLeave);
    if (timer) clearInterval(timer);
    timer = null;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = null;
    closeSections();
    flush();
    live = false;
  };
}
