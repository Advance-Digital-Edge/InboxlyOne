"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ScrollCTAProps = {
  isSubmittedProp?: boolean;
  heroId?: string; // when scrolled past this -> show
  formId?: string; // when this is visible -> hide
};

export default function ScrollCTA({
  isSubmittedProp,
  heroId = "hero",
  formId = "primary-cta-form",
}: ScrollCTAProps) {
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("inboxlyone_joined") === "1";
  });

  useEffect(() => {
    if (typeof isSubmittedProp === "boolean") {
      setIsSubmitted(isSubmittedProp);
      if (isSubmittedProp) localStorage.setItem("inboxlyone_joined", "1");
    }
  }, [isSubmittedProp]);

  // control visibility based on hero/form
  useEffect(() => {
    if (typeof window === "undefined") return;

    const targets: Element[] = [];
    const heroEl = document.getElementById(heroId);
    const formEl = document.getElementById(formId);
    if (heroEl) targets.push(heroEl);
    if (formEl) targets.push(formEl);

    // Fallback if nothing to observe: show after small scroll
    if (targets.length === 0) {
      const onScroll = () =>
        setVisible(window.scrollY > 300 && !dismissed && !isSubmitted);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    let anyInView = false;
    const io = new IntersectionObserver(
      (entries) => {
        anyInView = entries.some((e) => e.isIntersecting);
        setVisible(!anyInView && !dismissed && !isSubmitted);
      },
      {
        root: null,
        rootMargin: "-10% 0px -70% 0px",
        threshold: [0, 0.01, 0.2, 0.5, 1],
      }
    );

    targets.forEach((t) => io.observe(t));

    const onScroll = () => setVisible(!anyInView && !dismissed && !isSubmitted);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [heroId, formId, dismissed, isSubmitted]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("inboxlyone_cta_dismissed", "1");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem("inboxlyone_cta_dismissed") === "1");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: send to Supabase / API here
    localStorage.setItem("inboxlyone_joined", "1");
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed top-1 inset-x-0 mx-auto z-50 w-[320px]"
          role="region"
          aria-label="Get early access"
        >
          <div className="relative rounded-2xl shadow-2xl bg-gradient-to-r from-indigo-800/90 via-purple-800/90 to-indigo-900/90 backdrop-blur-md p-4 border border-white/10">
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ✕
            </button>

            <p className="text-base text-center   font-black text-white mb-1">
              Don't miss out
            </p>
            <p className="text-sm text-center text-gray-200 mb-3">
              Hop on and be the first one to experience Inboxlyone
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 bg-white text-gray-900 border border-gray-300 focus-visible:ring-2 focus-visible:ring-purple-500"
                  aria-label="Email address"
                />
                <Button
                  type="submit"
                  className="h-10 font-semibold text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                >
                  Join Early Access
                </Button>
              </form>
            ) : (
              <div className="text-sm text-center text-green-400 font-semibold">
                🎉 You’re in! We’ll keep you posted.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
