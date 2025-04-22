import Hero from "@/components/sections/Hero/Hero";
import Features from "@/components/sections/Features/Features";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import Pricing from "@/components/sections/Pricing/Pricing";
import Testimonials from "@/components/sections/Testimonials/Testimonials";
import CTA from "@/components/sections/CTA/Cta";

export default async function Home() {
  return (
    <main className="flex-1 flex flex-col gap-6 px-4">
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
    </main>
  );
}
