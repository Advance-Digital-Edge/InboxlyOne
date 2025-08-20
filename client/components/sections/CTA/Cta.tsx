"use client";

import type React from "react";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CTA({ id }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // Here you would typically send the email to your backend
      console.log("Email submitted:", email);
    }
  };

  return (
    <section id={id} className="py-24 px-4 ">
      <div className="max-w-4xl mx-auto">
        {/* Main CTA Card */}
        <Card className="p-12 border-0  bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-8 w-20 h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full"></div>
            <div className="absolute top-16 right-12 w-12 h-12 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full"></div>
            <div className="absolute bottom-12 left-16 w-16 h-16 bg-gradient-to-br from-pink-200 to-indigo-200 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-8 h-8 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Transformation Visual */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-6">
                {/* Before: Chaotic state */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center opacity-60">
                    <div className="relative">
                      <div className="w-8 h-8 border-2 border-red-400 rounded animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                </div>

                {/* Transformation Arrow */}
                <div className="flex items-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-red-300 via-purple-300 to-green-300 rounded-full relative">
                    <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-green-400 border-t-2 border-t-transparent border-b-2 border-b-transparent transform -translate-y-1"></div>
                  </div>
                </div>

                {/* After: Empowered state */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Headlines */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
              No noise. Just what matters.
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the waitlist and never miss another opportunity
            </p>

            {/* Email Signup Form */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 px-4 shadow-purple-900 shadow-md rounded-2xl border-0 bg-white/80 backdrop-blur-sm  focus:shadow-lg transition-all duration-300 text-gray-900 placeholder:text-gray-500"
                  />
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Early Access
                  </Button>
                </div>
              </form>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    You're on the list!
                  </h3>
                  <p className="text-gray-600">
                    We'll notify you when Inboxlyone is ready. Stay tuned!
                  </p>
                </div>
              </div>
            )}

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <span>Exclusive early access</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Limited spots available</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
