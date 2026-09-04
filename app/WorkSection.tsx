import CaseStudyCard from "@/components/CaseStudyCard";
import Reveal from "@/components/Reveal";
import { CASE_STUDIES } from "@/lib/content";

export default function WorkSection() {
  return (
    <section id="work" className="scroll-mt-[68px] bg-background-light">
      <div className="mx-auto w-full max-w-[1208px] px-6 py-[clamp(80px,9vw,128px)]">
        <Reveal className="mb-[clamp(36px,4vw,56px)] flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">
              Selected work
            </span>
            <h2 className="font-display text-[clamp(38px,4.6vw,60px)] leading-none tracking-[0.01em]">
              THINGS I BUILT AND SHIPPED
            </h2>
          </div>
          <p className="max-w-[34ch] text-[15px] font-light leading-[1.6] text-foreground-dim text-pretty">
            Three projects that show the range: systems performance, computer
            vision, and developer tooling.
          </p>
        </Reveal>

        <div className="flex flex-col gap-5">
          {CASE_STUDIES.map((study, i) => (
            <CaseStudyCard key={study.title} study={study} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
