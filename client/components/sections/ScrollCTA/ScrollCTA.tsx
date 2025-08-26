"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WaitlistForm from "@/components/ui/WaitlistForm/WaitlistForm";

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
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Track intersection state across callbacks
  const anyInViewRef = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSubmitted(localStorage.getItem("inboxlyone_joined") === "1");
    setDismissed(localStorage.getItem("inboxlyone_cta_dismissed") === "1");
  }, []);

  // External control
  useEffect(() => {
    if (typeof isSubmittedProp === "boolean") {
      setIsSubmitted(isSubmittedProp);
      if (isSubmittedProp && typeof window !== "undefined") {
        localStorage.setItem("inboxlyone_joined", "1");
      }
    }
  }, [isSubmittedProp]);

  // Visibility logic (based on hero/form)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const heroEl = document.getElementById(heroId);
    const formEl = document.getElementById(formId);
    const targets: Element[] = [];
    if (heroEl) targets.push(heroEl);
    if (formEl) targets.push(formEl);

    // Helper to compute visibility consistently
    const computeVisible = () => {
      setVisible(!anyInViewRef.current && !dismissed && !isSubmitted);
    };

    // Fallback: no observed elements -> show after small scroll
    if (targets.length === 0) {
      const onScroll = () => {
        const scrolledPast = window.scrollY > 300;
        const nextVisible = scrolledPast && !dismissed && !isSubmitted;
        setVisible(nextVisible);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const io = new IntersectionObserver(
      (entries) => {
        anyInViewRef.current = entries.some((e) => e.isIntersecting);
        computeVisible();
      },
      {
        root: null,
        rootMargin: "-10% 0px -70% 0px",
        threshold: [0, 0.01, 0.2, 0.5, 1],
      }
    );

    targets.forEach((t) => io.observe(t));

    // Keep in sync on scroll as well
    const onScroll = () => computeVisible();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Recompute if deps change (dismissed/submitted toggled)
    computeVisible();

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

  // Also guard render with dismissed/submitted
  const shouldShow = visible && !dismissed && !isSubmitted;

  return (
    <AnimatePresence>
      {shouldShow && (
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

            <p className="text-base text-center font-black text-white mb-1">
              Don’t miss out
            </p>
            <p className="text-sm text-center text-gray-200 mb-3">
              Hop on and be the first to experience Inboxlyone
            </p>

            <WaitlistForm
              source="scroll-cta"
              variant="stacked"
              className="max-w-md mx-auto"
              onSuccess={() => {
                setTimeout(() => setIsSubmitted(true), 3000);
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
