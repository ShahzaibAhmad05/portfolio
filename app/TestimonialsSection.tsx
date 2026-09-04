import Image from "next/image";
import Reveal from "@/components/Reveal";
import { TESTIMONIALS } from "@/lib/content";

export default function TestimonialsSection() {
  return (
    <section data-section="testimonials" className="border-t border-hairline bg-background">
      <div className="mx-auto w-full max-w-[1208px] px-6 py-[clamp(80px,9vw,128px)]">
        <Reveal className="mb-[clamp(36px,4vw,56px)] flex flex-col gap-3">
          <span className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">
            Client feedback
          </span>
          <h2 className="font-display text-[clamp(38px,4.6vw,60px)] leading-none tracking-[0.01em]">
            FROM PEOPLE WHO PAID FOR IT
          </h2>
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] gap-5">
          {TESTIMONIALS.map((item, i) => (
            <Reveal
              as="figure"
              key={item.name}
              delay={i * 90}
              className="flex flex-col gap-[22px] rounded-[18px] border border-white/[0.08] bg-background-light p-8"
            >
              <blockquote className="text-xl font-light leading-[1.45] text-pretty">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 border-t border-hairline pt-5">
                <Image
                  src={item.avatar}
                  alt={item.name}
                  width={42}
                  height={42}
                  className="size-[42px] shrink-0 rounded-full object-cover"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-medium">{item.name}</span>
                  <span className="text-xs font-light text-foreground-muted">
                    {item.role}
                  </span>
                </div>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
