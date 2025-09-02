"use client";
import { motion, AnimatePresence } from "framer-motion";
import WaitlistForm from "@/components/ui/WaitlistForm/WaitlistForm";
import { LiveMessagesFeed } from "@/components/ui/LiveMessageFeed/LiveMessageFeed";

export default function HomePage({ id }: { id?: string }) {
  return (
    <div id={id} className="min-h-32 w-full scroll-mt-24 lg:scroll-mt-32">
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-3xl">
          {/* Force both tracks to be minmax(0,1fr) to allow shrinking */}
          <div className="grid gap-12 lg:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            {/* Left Column */}
            <div className="space-y-8 px-8 text-center lg:text-left min-w-0">
              <div className="w-full md:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="leading-tight tracking-wide text-gray-900
                             text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-bold"
                >
                  <span className="block">All your messages</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    // allow wrapping + breaking on narrow screens
                    className="block break-words bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent"
                  >
                    One inbox. Zero chaos
                  </motion.span>
                </motion.h1>

                <p className="mt-4 text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Stay calm and in control. All your conversations in one inbox
                  - no missed messages, no lost clients.
                </p>
              </div>

              <div className="mx-auto max-w-md lg:mx-0">
                <WaitlistForm source="hero" />
              </div>

              <div className="flex flex-row justify-center gap-4 text-xs text-gray-500 md:text-sm lg:justify-start sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-600" />
                  <span>Exclusive early access</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="min-w-0 overflow-hidden">
              <LiveMessagesFeed />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
