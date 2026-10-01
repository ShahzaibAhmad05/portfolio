"use client";

import { useEffect } from "react";

const ICONS = [1, 2, 3, 4, 5].map((n) => `/favicons/${n}.png`);
const SWAP_MS = 250;

/** Flicks the tab icon between the five S marks: random order, never the same one twice running. */
export default function FaviconCycle() {
  useEffect(() => {
    // warm the cache so a swap never shows a blank icon
    ICONS.forEach((src) => (new Image().src = src));
    let last = -1;
    const swap = () => {
      // pick among the other four, so the next icon always differs from the current one
      const next = (last + 1 + Math.floor(Math.random() * (ICONS.length - 1))) % ICONS.length;
      last = next;
      const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
      links.forEach((link) => {
        link.type = "image/png";
        link.href = ICONS[next];
      });
      if (!links.length) {
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/png";
        link.href = ICONS[next];
        document.head.appendChild(link);
      }
    };
    swap();
    const id = setInterval(swap, SWAP_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
