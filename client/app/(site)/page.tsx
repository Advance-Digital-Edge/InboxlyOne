// app/page.tsx

import Hero from "@/components/sections/Hero/Hero";
import Features from "@/components/sections/Features/Features";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import Pricing from "@/components/sections/Pricing/Pricing";
import Testimonials from "@/components/sections/Testimonials/Testimonials";
import CTA from "@/components/sections/CTA/Cta";
import { JSX } from "react";
import FAQ from "@/components/sections/FAQ/FAQ";
import ScrollCTA from "@/components/sections/ScrollCTA/ScrollCTA";
import BuiltForYou from "@/components/sections/BuiltForYou/BuiltForYou";

export default function Home(): JSX.Element {
  return (
    <main className="flex-1  bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col ">
      <Hero id="hero" />
      <Features  />
      <HowItWorks />
      <BuiltForYou  id="built-for-you"/>
      {/* <Pricing />
      <Testimonials /> */}
      <CTA id="primary-cta-form" />
      <FAQ />
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      {/* <CTA id="primary-cta-form" /> */}
      <ScrollCTA />
    </main>
  );
}
