"use client";

import { Briefcase, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import clsx from "clsx";

type BuiltForYouProps = {
  id?: string;
  className?: string;
};

export default function BuiltForYou({ id, className = "" }: BuiltForYouProps) {
  const theme = {
    freelancer: {
      dot: "bg-blue-500",
      bubbleBg: "bg-blue-50",
      icon: "text-blue-600",
      surfaceGrad: "from-blue-500/10 to-indigo-500/10",
      glow: "from-blue-50 to-indigo-50",
      textGrad: "from-blue-700 to-indigo-700",
      featureIcon: "text-blue-600",
    },
    creator: {
      dot: "bg-purple-500",
      bubbleBg: "bg-purple-50",
      icon: "text-purple-600",
      surfaceGrad: "from-purple-500/10 to-pink-500/10",
      glow: "from-purple-50 to-pink-50",
      textGrad: "from-purple-700 to-pink-700",
      featureIcon: "text-purple-600",
    },
    store: {
      dot: "bg-emerald-500",
      bubbleBg: "bg-emerald-50",
      icon: "text-emerald-600",
      surfaceGrad: "from-emerald-500/10 to-teal-500/10",
      glow: "from-emerald-50 to-teal-50",
      textGrad: "from-emerald-700 to-teal-700",
      featureIcon: "text-emerald-600",
    },
  } as const;

  const cards = [
    {
      title: "Freelancers",
      desc: "Be the fast reply clients remember. Ship work, not apologies.",
      Icon: Briefcase,
      variant: "freelancer" as const,
      features: [
        "Replies in minutes, not hours",
        "One glance, zero inbox anxiety",
        "Projects stay on track (and so do you)",
      ],
    },
    {
      title: "Creators",
      desc: "Stay in flow. Quick answers to brands & fans without the mental clutter.",
      Icon: Sparkles,
      variant: "creator" as const,
      features: [
        "Fewer check-ins, more creating",
        "Fast responses build momentum & trust",
        "No “did I miss something?” stress",
      ],
    },
    {
      title: "Solo Stores",
      desc: "Answer before they bounce - speed that saves the sale.",
      Icon: ShoppingBag,
      variant: "store" as const,
      features: [
        "Respond in minutes - keep carts warm",
        "One place to look, clear head",
        "Customers feel seen (and come back)",
      ],
    },
  ];

  return (
    <section
      id={id}
      className={clsx(
        "w-screen py-20 md:py-32 px-4 relative overflow-hidden overflow-x-clip scroll-mt-24 lg:scroll-mt-20",
        "bg-gradient-to-br from-slate-50 via-white to-indigo-50",
        className
      )}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-10 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute top-1/3 right-8 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl relative min-w-0">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20 min-w-0">
          <h2 className="mt-4 uppercase font-mono text-4xl md:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
              Built For You
            </span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed break-words">
        One inbox , Quick answers, Calm mind, No missed messages.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-16 min-w-0">
          {cards.map(({ title, desc, Icon, variant, features }, index) => {
            const t = theme[variant];
            return (
              <div
                key={title}
                className={clsx(
                  "group relative overflow-hidden rounded-3xl min-w-0",
                  "border border-gray-200 bg-white/80 backdrop-blur-sm",
                  "p-8 shadow-sm transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-0.5"
                )}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {/* Soft surface tint */}
                <div
                  className={clsx(
                    "absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity duration-300 group-hover:opacity-50",
                    t.surfaceGrad
                  )}
                />
                {/* Glow */}
                <div
                  className={clsx(
                    "pointer-events-none absolute -inset-20 rounded-[40px] bg-gradient-to-br opacity-60 blur-3xl",
                    t.glow
                  )}
                  aria-hidden="true"
                />
                {/* Sheen on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 ease-out" />

                {/* Content */}
                <div className="relative z-10 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-6 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={clsx("w-3 h-3 rounded-full shrink-0", t.dot)} />
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {title}
                      </h3>
                    </div>
                    <div
                      className={clsx(
                        "flex items-center justify-center w-16 h-16 rounded-2xl border shrink-0",
                        t.bubbleBg,
                        "border-gray-200/60"
                      )}
                    >
                      <Icon className={clsx("w-8 h-8", t.icon)} />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed mb-6 break-words">
                    {desc}
                  </p>

                  {/* Bullets */}
                  <div className="space-y-2 mb-6">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                        <ArrowRight className={clsx("w-4 h-4 shrink-0", theme[variant].featureIcon)} />
                        <span className="break-words">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
