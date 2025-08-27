import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function Features() {
  const features = [
    {
      title: "Never Lose Another Message",
      description:
        "Important emails and DMs vanish in the chaos of tabs and apps. Bring them all together, so every message gets seen and answered.",
      icon: (
        <div className="relative w-20 h-20 mx-auto mb-6 float-animation transform-gpu overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute inset-0 rounded-full pulse-glow pointer-events-none" />
          {/* Main icon */}
          <div className="relative w-full h-full bg-gradient-to-r from-green-500/50 to-green-800 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      ),
    },
    {
      title: "One Inbox. Fewer Distractions",
      description:
        "Constant app-switching steals your focus and time. Cut the noise. Keep your Gmail, Instagram, and Facebook side by side in one clean hub.",
      icon: (
        <div className="relative w-20 h-20 mx-auto mb-6 float-animation transform-gpu overflow-hidden">
          <div className="absolute inset-0 rounded-2xl pulse-glow pointer-events-none" />
          <div className="relative w-full h-full bg-blue-600/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Image
              src="/assets/inboxlyone.png"
              alt="Inboxlyone"
              width={40}
              height={40}
              className="object-contain mx-2"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Stay on top of every conversation",
      description:
        "Slow replies frustrate clients and make them more likely to walk away. Reply faster, stay organized, and keep clients smiling — all from one place.",
      icon: (
        <div className="relative w-20 h-20 mx-auto mb-6 float-animation transform-gpu overflow-hidden">
          <div className="absolute inset-0 rounded-xl pulse-glow pointer-events-none" />
          <div className="relative w-full h-full bg-gradient-to-r from-yellow-500/50 to-orange-900 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
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
      ),
    },
  ];

  return (
    <section id="features" className="py-24 px-4  relative   scroll-mt-24 lg:scroll-mt-32">
      {/* Background decoration */}
      <div className="absolute inset-0  " />

      <div className="max-w-7xl mx-auto relative min-w-0">
        {/* Section Header */}
        <div className="text-center mb-20 min-w-0">
          <h2 className="text-5xl font-sans font-black uppercase mb-6 leading-tight break-words">
            Lost Messages ={" "}
            <span className="bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
              Lost Clients
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light break-words">
            Every missed DM or email is a missed opportunity.
            <span className="text-gray-900 font-medium">
              {" "}
              Stop letting chaos cost you business.
            </span>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12 min-w-0">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative p-8 md:p-10 border-none hover:shadow-xl transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden backdrop-blur-sm min-w-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-indigo-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 min-w-0">
                {feature.icon}
                <div className="text-center min-w-0">
                  <h3 className="text-2xl md:text-3xl font-black text-card-foreground mb-4 font-sans group-hover:text-purple-900 transition-colors duration-300 break-words">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg font-light break-words">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-8 flex justify-center">
                  <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-indigo-900 rounded-full group-hover:w-24 transition-all duration-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
