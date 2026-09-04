import Reveal from "@/components/Reveal";
import { SERVICES } from "@/lib/content";

export default function ServicesSection() {
  return (
    <section
      data-section="services"
      id="services"
      className="scroll-mt-[68px] border-t border-hairline bg-background"
    >
      <div className="mx-auto w-full max-w-[1208px] px-6 py-[clamp(80px,9vw,128px)]">
        <Reveal className="mb-[clamp(36px,4vw,56px)] flex max-w-[56ch] flex-col gap-3">
          <span className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">
            Services
          </span>
          <h2 className="font-display text-[clamp(38px,4.6vw,60px)] leading-none tracking-[0.01em]">
            WHAT I TAKE ON
          </h2>
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(272px,1fr))] gap-5">
          {SERVICES.map((service, i) => (
            <Reveal
              key={service.number}
              delay={i * 90}
              className="flex flex-col gap-3.5 rounded-[18px] border border-white/[0.08] bg-background-light p-[34px] transition-colors duration-200 hover:border-accent/40"
            >
              <span className="font-display text-[30px] leading-none text-accent">
                {service.number}
              </span>
              <h3 className="text-[21px] leading-[1.25] font-medium">
                {service.title}
              </h3>
              <p className="text-[15px] font-light leading-[1.65] text-foreground-dim text-pretty">
                {service.body}
              </p>
              <span className="mt-auto border-t border-hairline pt-3.5 text-xs text-foreground-faint">
                {service.stack}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
