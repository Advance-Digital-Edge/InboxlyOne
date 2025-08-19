"use client";
import { Card } from "@/components/ui/card";
import OrbitingIcons from "@/components/ui/OrbitingIcons/OrbitingIcons";
import { Facebook, Instagram, Mail } from "lucide-react";
import Image from "next/image";

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 ">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            See how chaos turns into clarity - all your conversations in one
            organized inbox
          </p>
        </div>

        {/* Main Transformation Visual */}
        <div className="relative mb-16">
          <Card className="p-12  border-0 rounded-3xl">
            <div className="flex w-full flex-col lg:flex-row items-center justify-around space-y-8 lg:space-y-0 lg:space-x-12">
              {/* Before: Scattered Platforms */}
              <div className="flex-1 text-center">
                <Image
                  src="/assets/overwhelmed.jpg"
                  alt="overwhelmed"
                  width={600}
                  height={600}
                  className="object-contain mb-4 mx-1"
                />
                <p className="text-sm   mt-4 max-w-xs mx-auto">
                  Too many apps. Too many tabs. Not enough focus.
                </p>
              </div>

              {/* Transformation Arrow */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-10 h-10 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                  {/* Magical sparkles */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
                  <div
                    className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-300 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </div>
              </div>

              {/* After: Unified Hub */}
              <div className="flex-1 text-center">
                <div className="relative mx-auto w-full max-w-md">
                  <OrbitingIcons height={420} className="mx-auto" />
                </div>
                <p className="text-sm mt-2 max-w-xs mx-auto">
                  All your conversations. Zero chaos
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">
              Connect in Seconds
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Link Gmail, Instagram, Facebook, and more with just a few clicks
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-emerald-600">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">
              Everything, Finally Organized
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              All your messages flow into one organized inbox — neatly separated
              by platform
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">
              Peace of Mind, Every Day
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Respond faster, stay organized, and never miss another important
              message
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
