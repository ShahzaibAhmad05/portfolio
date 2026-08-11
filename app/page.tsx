"use client";

import { useEffect } from "react";
import IntroSection from "./IntroSection";
import StatsSection from "./StatsSection";
import ReviewsSection from "./ReviewsSection";
import ServicesSection from "./ServicesSection";
import Footer from "./Footer";
import { trackVisitor } from "@/lib/stats";

export default function Home() {
  useEffect(() => {
    trackVisitor();
  }, []);

  return (
    <main className="flex flex-col">
      <IntroSection />
      <StatsSection />
      <ReviewsSection />
      <ServicesSection />
      <Footer />
    </main>
  );
}
