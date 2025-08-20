"use client";

import { Briefcase, ShoppingBag, Sparkles } from "lucide-react";

type BuiltForYouProps = { id?: string; className?: string };

export default function BuiltForYou({ id, className = "" }: BuiltForYouProps) {
  const cards = [
    {
      title: "Freelancers",
      desc: "Keep every client message in one place — no app hopping.",
      Icon: Briefcase,
      glow: "from-blue-50 to-indigo-50",
      dot: "bg-blue-500",
    },
    {
      title: "Creators",
      desc: "DMs and emails together, so you can focus on creating.",
      Icon: Sparkles,
      glow: "from-purple-50 to-pink-50",
      dot: "bg-purple-500",
    },
    {
      title: "Solo stores",
      desc: "Never miss a customer question across Instagram, Facebook, and Gmail.",
      Icon: ShoppingBag,
      glow: "from-emerald-50 to-teal-50",
      dot: "bg-emerald-500",
    },
  ];

  return (
    <section
      id={id}
      className={`w-full py-20 px-4 ${className}`}
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Built for you
          </h2>
          <p className="mt-3 text-gray-600 text-base sm:text-lg">
            Designed for solo pros who want less chaos and more clarity.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ title, desc, Icon, glow, dot }) => (
            <div
              key={title}
              className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md`}
            >
              {/* soft background glow */}
              <div
                className={`pointer-events-none absolute -inset-16 rounded-[32px] bg-gradient-to-br ${glow} opacity-60 blur-2xl`}
                aria-hidden="true"
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${dot} shadow-sm`}
                    aria-hidden="true"
                  />
                  <Icon className="h-5 w-5 text-gray-800" aria-hidden="true" />
                  <h3 className="ml-1 text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                </div>
                <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Subtle reassurance line */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Works with one account per platform — perfect for solo workflows.
        </p>
      </div>
    </section>
  );
}
