"use client";

import { useEffect, useState } from "react";

export function Typewriter({
  text,
  className,
  ms = 40,
}: {
  text: string;
  className?: string;
  ms?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= text.length) return;
    const id = setTimeout(() => setN((i) => i + 1), ms);
    return () => clearTimeout(id);
  }, [n, text, ms]);

  return <span className={className}>{text.slice(0, n)}</span>;
}
