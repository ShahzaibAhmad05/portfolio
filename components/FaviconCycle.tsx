"use client";

import { useEffect } from "react";

const ICONS = [1, 2, 3, 4, 5].map((n) => `/favicons/${n}.png`);
const SWAP_MS = 250;

const toDataUrl = async (src: string) => {
  const blob = await (await fetch(src)).blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

/** Flicks the tab icon between the five S marks: random order, never the same one twice running. */
export default function FaviconCycle() {
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    // The browser re-requests a favicon every time the href changes to a new URL, and drops the
    // request still in flight. Off localhost that round trip outlasts SWAP_MS, so no swap ever
    // lands. Inlined as data URLs the icons need no request at all.
    Promise.all(ICONS.map(toDataUrl))
      .then((icons) => {
        if (cancelled) return;
        let last = -1;
        const swap = () => {
          // pick among the other four, so the next icon always differs from the current one
          const next = (last + 1 + Math.floor(Math.random() * (icons.length - 1))) % icons.length;
          last = next;
          const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
          links.forEach((link) => {
            link.type = "image/png";
            link.href = icons[next];
          });
          if (!links.length) {
            const link = document.createElement("link");
            link.rel = "icon";
            link.type = "image/png";
            link.href = icons[next];
            document.head.appendChild(link);
          }
        };
        swap();
        id = setInterval(swap, SWAP_MS);
      })
      // the resting icon from the metadata stays put if the icons can't be fetched
      .catch(() => {});

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return null;
}
