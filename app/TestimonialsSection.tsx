import Image from "next/image";
import Reveal from "@/components/Reveal";
import { TESTIMONIALS } from "@/lib/content";

// every card opens the gig the reviews were left on, so they can be checked
const SOURCE = "https://www.fiverr.com/shahzaibahmad05/convert-your-python-projects-to-exe";

const MARK = "font-serif text-5xl leading-[0] align-[-0.3em]";

export default function TestimonialsSection() {
  return (
    // the last sheet of the paper layer; Contact shows through its rounded corners
    <section
      id="testimonials"
      data-section="testimonials"
      className="relative z-10 scroll-mt-[88px] rounded-b-[40px] bg-background px-[clamp(20px,9.72vw,140px)] py-[clamp(88px,8.9vw,128px)]"
    >
      <div className="mb-14 flex flex-col gap-3">
        <span className="font-serif text-[18.18px] leading-[25.452px] italic">Testimonials</span>
        <h2 className="font-serif text-[21.26px] leading-[25.512px] font-normal">From my clients on Fiverr, in their own words</h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {TESTIMONIALS.map((item, i) => (
          <a key={item.name} href={SOURCE} target="_blank" rel="noreferrer" data-cursor-label="VERIFY" className="flex">
            <Reveal as="figure" delay={i * 90} className="m-0 flex w-full flex-col gap-[22px] bg-surface p-8">
              <blockquote className="m-0 font-serif text-[21.26px] leading-[25.51px]">
                <span aria-hidden className={`${MARK} mr-0.5`}>“</span>
                {item.quote}
                <span aria-hidden className={`${MARK} ml-0.5`}>”</span>
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 border-t border-hairline-strong pt-5">
                <Image src={item.avatar} alt={item.name} width={42} height={42} className="size-[42px] rounded-full object-cover" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg leading-[27px] font-semibold">{item.name}</span>
                  <span className="text-[13px] leading-[20.8px] text-foreground-dim">{item.role}</span>
                </div>
              </figcaption>
            </Reveal>
          </a>
        ))}
      </div>
    </section>
  );
}
