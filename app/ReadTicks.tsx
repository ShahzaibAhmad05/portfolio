type ReadTicksProps = {
  readAt: string | null;
  light?: boolean;
};

export default function ReadTicks({ readAt, light }: ReadTicksProps) {
  const color = readAt
    ? "text-sky-400"
    : light
      ? "text-surface/70"
      : "text-muted";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 16"
      className={`inline-block size-4 ${color}`}
      aria-label={readAt ? "Read" : "Delivered"}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1 8l4 4L13 2"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 8l4 4L20 2"
      />
    </svg>
  );
}
