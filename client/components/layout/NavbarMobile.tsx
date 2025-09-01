"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { useAuth } from "@/app/context/AuthProvider";
import Image from "next/image";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => setIsOpen((v) => !v);
  const closeMenu = () => setIsOpen(false);

  // Close on route change
  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock scroll & focus management
  useEffect(() => {
    if (isOpen) {
      const { body } = document;
      const prev = body.style.overflow;
      body.style.overflow = "hidden";

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeMenu();
        if (e.key === "Tab" && focusable && focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const active = document.activeElement as HTMLElement | null;

          if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", onKeyDown);
      return () => {
        body.style.overflow = prev;
        document.removeEventListener("keydown", onKeyDown);
        triggerRef.current?.focus();
      };
    }
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Top bar with trigger */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          ref={triggerRef}
          onClick={toggleMenu}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm transition active:scale-95"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={closeMenu}
          />

          {/* Slide-in panel */}
          <div
            ref={panelRef}
            className="absolute inset-x-0 top-0 rounded-b-2xl bg-white shadow-2xl
                       pt-[calc(env(safe-area-inset-top,0)+12px)] pb-[calc(env(safe-area-inset-bottom,0)+16px)]
                       animate-in fade-in zoom-in-95 slide-in-from-top duration-200
                       px-6"
          >
            {/* Header row inside panel */}
            <div className="mb-4 flex items-center align-baseline justify-between">
              <Link href={"/"}>
                <div className="flex  items-baseline">
                  <Image
                    src="/assets/inboxlyone.png"
                    alt="Inboxlyone"
                    width={20} // adjust size
                    height={20} // adjust size
                    className="object-contain  mx-2"
                  />
                  <span className="text-purple-900 text-xl font-medium">
                    Inboxlyone
                  </span>
                </div>
              </Link>
              <button
                onClick={closeMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-2">
              <Link
                href="/#features"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                How It Works
              </Link>
              <Link
                href="/#built-for-you"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                Why Us
              </Link>
              <Link
                href="/#faq"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                FAQ
              </Link>

              {/* Auth Area */}
              <div className="my-2 border-t border-gray-200" />
              <div className="flex gap-2">
                <Link href="/sign-in" className="w-1/2" onClick={closeMenu}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-base font-medium text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700 hover:shadow-xl">
                    Get Started
                  </Button>
                </Link>
              </div>

              {/* Secondary links (optional) */}
              <div className="flex items-center justify-between px-1 pt-2 text-sm text-gray-500">
                <Link
                  href="/privacy"
                  onClick={closeMenu}
                  className="hover:underline"
                >
                  Privacy
                </Link>
                <Link
                  href="/tos"
                  onClick={closeMenu}
                  className="hover:underline"
                >
                  Terms
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
