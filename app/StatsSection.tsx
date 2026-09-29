import CountUp from "@/components/CountUp";
import Reveal from "@/components/Reveal";
import { STATS } from "@/lib/content";

export default function StatsSection() {
  return (
    <section className="border-b border-hairline bg-background">
      <div className="mx-auto grid w-full max-w-[1208px] grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-8 px-6 py-[clamp(44px,4.5vw,64px)]">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 90} className="flex flex-col gap-1.5">
            <CountUp
              to={stat.to}
              suffix={stat.suffix}
              delay={i * 90}
              className={`font-display text-[52px] leading-none ${
                stat.accent ? "text-accent" : "text-foreground"
              }`}
            />
            <span className="text-[13px] font-light text-foreground-dim">
              {stat.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
