type IconProps = {
  src: string;
  size?: number;
  className?: string;
};

/** Theme-aware icon via mask so white Figma SVGs work in light + dark. */
export default function Icon({ src, size = 20, className = "" }: IconProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-foreground ${className}`}
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
