import { Fragment } from "react";

/** Renders `backticked` spans as inline code chips, everything else as text. */
export default function CodeText({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 ? (
          <code key={i} className="rounded bg-foreground/[0.07] px-1 py-0.5 font-mono text-[0.85em] tracking-normal">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
