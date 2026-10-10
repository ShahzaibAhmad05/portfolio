import Image from "next/image";
import Reveal from "@/components/Reveal";
import CodeText from "@/components/CodeText";
import { WORK } from "@/lib/content";

const ALIGN = { start: "self-start", center: "self-center", end: "self-end" } as const;
// each tile fades in from the side it sits on; centred ones still rise from below
const FROM = { start: "left", center: "up", end: "right" } as const;

export default function WorkSection() {
  return (
    <section
      id="work"
      data-section="work"
      className="scroll-mt-[88px] rounded-b-3xl bg-background px-[clamp(16px,2.22vw,32px)] pt-[clamp(80px,8.9vw,128px)]"
    >
      <div className="mb-24 flex max-w-[751px] flex-col gap-3 md:ml-8">
        <span className="font-serif text-[18.18px] leading-[25.452px] italic">Selected Projects</span>
        <h2 className="font-serif text-[21.26px] leading-[25.512px] font-normal">
          Things I built solo, and tested on an audience
        </h2>
      </div>

      <div className="flex flex-col gap-[76px] pb-20">
        {WORK.map((work) => (
          <Reveal key={work.title} from={FROM[work.align]} className={`w-full max-w-[760px] ${ALIGN[work.align]}`}>
            <div data-agent-stop className="flex flex-col">
              <a
                href={work.href}
                target="_blank"
                rel="noreferrer"
                data-cursor-label="VIEW"
                className="relative block w-full overflow-hidden bg-surface"
                style={{ aspectRatio: work.ratio }}
              >
                <Image src={work.image} alt={`${work.title} preview`} fill sizes="(min-width: 800px) 760px, 100vw" loading="eager" placeholder="blur" className="object-cover" />
              </a>
              <span className="mt-[18px] font-serif text-[18.18px] leading-[25.45px]">{work.title}</span>
              <p className="mb-[18px] text-lg leading-[28.8px]">
                <CodeText text={work.summary} />
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="h-6 bg-foreground px-2 font-serif text-xs leading-6 tracking-[0.12px] text-on-ink">{work.stat}</span>
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="h-6 bg-foreground/5 px-2 font-serif text-xs leading-6 tracking-[0.12px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
