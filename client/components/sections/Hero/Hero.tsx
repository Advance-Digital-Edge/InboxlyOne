"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { LiveMessagesFeed } from "@/components/ui/LiveMessageFeed/LiveMessageFeed";
import { Mail, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function HomePage({ id }: { id?: string }) {
  return (
    <div id={id} className="min-h-32 w-full">
      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-3xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 justify-between">
            {/* Left Column - Content */}
            <div className="space-y-8 px-8 text-center lg:text-left">
              <div className="w-full">
                {/* Shared width + left alignment (responsive) */}
                <div className="md:text-left">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-6xl lg:text-5xl 2xl:text-6xl font-bold tracking-wide text-gray-900 leading-tight"
                  >
                    <span className="block whitespace-nowrap">
                      All your messages
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="block whitespace-nowrap bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent"
                    >
                      One inbox. Zero chaos.
                    </motion.span>
                  </motion.h1>

                  <p className="mt-4 text-lg sm:text-xl text-gray-600 leading-relaxed">
                    Stay calm and in control. All your conversations in one
                    inbox — no missed messages, no lost clients.
                  </p>
                </div>
              </div>

              {/* Email Signup Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get("email");
                  console.log("Email submitted:", email);
                  // TODO: send to backend / API
                }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center flex-col gap-3 sm:flex-row sm:gap-2 max-w-md mx-auto lg:mx-0">
                  <Input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    className="flex-1 h-12 px-4 shadow-purple-900 shadow-md rounded-2xl border-0 bg-white/80 backdrop-blur-sm  focus:shadow-lg transition-all duration-300 text-gray-900 placeholder:text-gray-500"
                  />
                  <Button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Early Access
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Don’t miss out — secure your spot on the waitlist
                </p>
              </form>

              <div className="flex flex-row justify-center gap-4 text-xs  text-gray-500  md:text-sm lg:justify-start sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                  <span>No credit card required </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
                  <span>Exclusive early access</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div>
              {/* Organized Inbox (After) */}
              <LiveMessagesFeed />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
