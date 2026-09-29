import Reveal from "@/components/Reveal";
import { APPROACH } from "@/lib/content";

export default function ApproachSection() {
  return (
    <section
      id="approach"
      className="scroll-mt-[68px] border-t border-hairline bg-background-light"
    >
      <div className="mx-auto grid w-full max-w-[1208px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[clamp(40px,5vw,80px)] px-6 py-[clamp(80px,9vw,128px)]">
        <Reveal from="left" className="flex min-w-0 flex-col gap-5">
          <span className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">
            How I work
          </span>
          <h2 className="font-display text-[clamp(38px,4.6vw,60px)] leading-none tracking-[0.01em]">
            CODE YOU CAN STILL READ IN A YEAR
          </h2>
          <p className="max-w-[46ch] text-base font-light leading-[1.7] text-foreground-dim text-pretty">
            I use AI the way it works: to ask questions, trace logic and check
            approaches. The decisions (what goes in, what stays out, what the
            trade-off costs) stay with me. That is the difference between a
            codebase you can hand to the next engineer and one nobody wants to
            open.
          </p>
        </Reveal>

        <div className="flex min-w-0 flex-col">
          {APPROACH.map((step, i) => (
            <Reveal
              key={step.number}
              delay={i * 90}
              className={`flex gap-5 border-t border-hairline-strong py-6 ${
                i === APPROACH.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="w-[34px] shrink-0 font-display text-[22px] leading-[1.1] text-accent">
                {step.number}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[17px] font-medium">{step.title}</h3>
                <p className="text-sm font-light leading-[1.6] text-foreground-dim">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
