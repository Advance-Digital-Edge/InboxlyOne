"use client";
import { Card } from "@/components/ui/card";
import OrbitingIcons from "@/components/ui/OrbitingIcons/OrbitingIcons";
import { ArrowRight, Zap, Clock, ShieldCheck, ArrowDown } from "lucide-react";
import Image from "next/image";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 w-full mx-auto md:py-16 lg:py-24 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-3xl md:text-4xl bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent lg:text-5xl font-black uppercase mb-4 md:mb-6 leading-tight">
            From Messy to <span>Easy</span> in 3 Steps
          </h2>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
            No more app-hopping. All your conversations, finally in one place.
          </p>
        </div>

        {/* Horizontal Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16 min-w-0">
          {/* Steps on the Left */}
          <div className="flex-1 px-2 space-y-6 md:space-y-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-[3rem_1fr] gap-4 items-start">
                {/* Badge */}
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-black text-white">1</span>
                </div>
                {/* Content */}
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Connect Once, Relax Forever
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    Gmail, Instagram, Messenger — all linked in one place in
                    seconds.
                  </p>
                  <span className="inline-block mt-2 rounded-full bg-green-400 px-3 py-1 text-xs sm:text-sm font-medium text-white">
                    No setup required
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-[3rem_1fr] gap-4 items-start">
                {/* Badge */}
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-black text-white">2</span>
                </div>
                {/* Content */}
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Stay Organized Without Trying
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    Each platform has its own tab, so you always know where to
                    look.
                  </p>
                  <span className="inline-block mt-2 rounded-full bg-green-400 px-3 py-1 text-xs sm:text-sm font-medium text-white">
                    Zero confusion
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-[3rem_1fr] gap-4 items-start">
                {/* Badge */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl font-black text-white">3</span>
                </div>
                {/* Content */}
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Stay in Control
                  </h3>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    Respond on time, close deals, and keep conversations under
                    control.
                  </p>
                  <span className="inline-block mt-2 rounded-full bg-green-400 px-3 py-1 text-xs sm:text-sm font-medium text-white">
                    Focus made easy
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual + Stats on the Right */}
          <div className="flex-1 hidden lg:block min-w-0">
            <Card className="w-full max-w-3xl overflow-hidden bg-gradient-to-br from-white via-purple-50 to-blue-50 border border-gray-100 rounded-3xl shadow-xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 min-w-0">
                {/* Before */}
                <div className="flex-1 text-center min-w-0">
                  <Image
                    src="/assets/overwhelmed.jpg"
                    alt="Overwhelmed"
                    width={400}
                    height={400}
                    className="rounded-2xl  mx-auto mb-4 w-full max-w-[400px] h-auto"
                  />
                </div>

                {/* Arrow */}
                <ArrowRight className="w-12 h-12 text-purple-600 hidden lg:block shrink-0" />
                <ArrowDown className="w-12 h-12 text-purple-600 lg:hidden mb-4" />

                {/* After */}
                <div className="flex-1 text-center min-w-0 overflow-hidden">
                  <OrbitingIcons className="mx-auto w-full max-w-[600px]" />
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm text-gray-500">
                      Saved Time
                    </span>
                    <span className="text-3xl font-extrabold text-emerald-700">
                      10h+
                    </span>
                    <p className="block text-sm text-gray-500">per week</p>
                  </div>
                  <Clock className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm text-gray-500">
                      Faster Replies
                    </span>
                    <span className="text-3xl font-extrabold text-blue-700">
                      10x
                    </span>
                    <p className="block text-sm text-gray-500">quicker</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm text-gray-500">
                      Peace of Mind
                    </span>
                    <span className="text-3xl font-extrabold text-purple-700">
                      100%
                    </span>
                    <p className="block text-sm text-gray-500">everyday</p>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
