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

    // Hide when ANY target is in view.
    let anyInView = false;
    const io = new IntersectionObserver(
      (entries) => {
        anyInView = entries.some((e) => e.isIntersecting);
        setVisible(!anyInView && !dismissed && !isSubmitted);
      },
      {
        // Make the hide zone larger so it hides while hero/cta are near viewport
        root: null,
        rootMargin: "-10% 0px -70% 0px", // top and bottom margins
        threshold: [0, 0.01, 0.2, 0.5, 1],
      }
    );

    targets.forEach((t) => io.observe(t));

    // Also guard against layout shifts
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
    localStorage.setItem("inboxlyone_joined", "1");
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed top-1/2 right-4 -translate-y-1/2 z-50 w-[320px]"
          role="region"
          aria-label="Get early access"
        >
          <div className="relative rounded-2xl shadow-xl  bg-black/95 backdrop-blur-md p-4">
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <p className="text-base  text-center font-semibold text-orange-500 mb-1">
              Don't miss your chance
            </p>
            <p className="text-sm text-white p-1 mb-3">
              Early access is limited - secure your spot on the waitlist
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 bg-white"
                  aria-label="Email address"
                />
                <Button
                  type="submit"
                  className="h-10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                  Get Early Access
                </Button>
              </form>
            ) : (
              <div className="text-sm text-green-700 font-medium">
                You’re on the list ✔
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
