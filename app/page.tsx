import ContactSection from "./ContactSection";
import CraftSection from "./CraftSection";
import HeroSection from "./HeroSection";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import TestimonialsSection from "./TestimonialsSection";
import WorkSection from "./WorkSection";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        {/* the paper layer: everything down to Testimonials is one sheet that slides up off Contact, which waits pinned beneath it */}
        {/* the 40px overlap is this layer's margin, not Contact's: a negative margin on the pinned block would let it poke out above main, behind the header */}
        {/* the clip lets the shadow fall only downward, onto Contact; unclipped, its blur also bleeds out above the layer and shows as a grey band behind the header */}
        <div className="relative z-[1] -mb-10 flex flex-col rounded-b-[40px] bg-background shadow-[0_28px_80px_rgba(0,0,0,0.16)] [clip-path:inset(0_0_-200px_0)]">
          <HeroSection />
          <WorkSection />
          <CraftSection />
          <TestimonialsSection />
        </div>
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
