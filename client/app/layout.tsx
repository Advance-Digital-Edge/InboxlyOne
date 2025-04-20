
import { Lusitana } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Hero from "@/components/sections/Hero/Hero";
import Features from "@/components/sections/Features/Features";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import Pricing from "@/components/sections/Pricing/Pricing";
import Testimonials from "@/components/sections/Testimonials/Testimonials";
import CTA from "@/components/sections/CTA/Cta";
import Footer from "@/components/layout/Footer";
import styles from "./layout.module.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const lusitanaSans = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lusitanaSans.className} suppressHydrationWarning>
      <body >
          <div className={styles.container}>
            <main>
              <Hero />
              <Features />
              <HowItWorks />
              <Pricing />
              <Testimonials />
              <CTA />
            </main>
            <Footer />
          </div>
      </body>
    </html>
  );
}
