import ApproachSection from "./ApproachSection";
import ContactSection from "./ContactSection";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import WorkSection from "./WorkSection";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        <HeroSection />
        <StatsSection />
        <WorkSection />
        <ServicesSection />
        <ApproachSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
