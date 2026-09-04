"use client";

import { useEffect } from "react";
import ApproachSection from "./ApproachSection";
import ContactSection from "./ContactSection";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import WorkSection from "./WorkSection";
import { trackVisitor } from "@/lib/stats";

export default function Home() {
  useEffect(() => {
    trackVisitor().catch(() => {});
  }, []);

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
