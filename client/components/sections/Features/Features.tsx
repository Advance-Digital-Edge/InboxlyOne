import { Card } from "@/components/ui/card"

export default function Features() {
  const features = [
    {
      title: "Never Lose Another Message",
      description:
        "Transform the chaos of scattered conversations into organized peace of mind. Every message finds its home.",
      beforeIcon: (
        <div className="relative">
          {/* Stressed/chaotic state */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-8 h-8 bg-red-200 rounded-lg rotate-12 absolute top-0 left-0"></div>
            <div className="w-6 h-6 bg-orange-200 rounded-lg -rotate-6 absolute top-2 right-1"></div>
            <div className="w-7 h-7 bg-yellow-200 rounded-lg rotate-45 absolute bottom-0 left-2"></div>
          </div>
          {/* Arrow showing transformation */}
          <div className="w-12 h-8 flex items-center justify-center">
            <div className="w-6 h-0.5 bg-gradient-to-r from-red-300 to-green-300 rounded-full relative">
              <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-green-300 border-t border-t-transparent border-b border-b-transparent transform -translate-y-0.5"></div>
            </div>
          </div>
        </div>
      ),
      afterIcon: (
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      color: "from-green-50 to-emerald-50",
    },
    {
      title: "One Inbox, Zero Stress",
      description: "Say goodbye to platform juggling. Manage all your conversations from one place.",
      beforeIcon: (
        <div className="relative">
          {/* Multiple scattered platforms */}
          <div className="absolute inset-0 opacity-40">
            <div className="w-4 h-4 bg-blue-300 rounded absolute top-0 left-0"></div>
            <div className="w-4 h-4 bg-purple-300 rounded absolute top-0 right-0"></div>
            <div className="w-4 h-4 bg-pink-300 rounded absolute bottom-0 left-0"></div>
            <div className="w-4 h-4 bg-indigo-300 rounded absolute bottom-0 right-0"></div>
          </div>
          {/* Transformation arrow */}
          <div className="w-12 h-8 flex items-center justify-center">
            <div className="w-6 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full relative">
              <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-blue-300 border-t border-t-transparent border-b border-b-transparent transform -translate-y-0.5"></div>
            </div>
          </div>
        </div>
      ),
      afterIcon: (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        </div>
      ),
      color: "from-blue-50 to-indigo-50",
    },
    {
      title: "Lightning-Fast Responses",
      description: "Turn customer wait time into wow time. Respond instantly.",
      beforeIcon: (
        <div className="relative">
          {/* Slow/delayed state */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-8 h-2 bg-red-200 rounded-full animate-pulse"></div>
            <div
              className="w-6 h-2 bg-orange-200 rounded-full mt-2 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="w-4 h-2 bg-yellow-200 rounded-full mt-2 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
          {/* Speed transformation */}
          <div className="w-12 h-8 flex items-center justify-center">
            <div className="w-6 h-0.5 bg-gradient-to-r from-orange-300 to-purple-300 rounded-full relative">
              <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-purple-300 border-t border-t-transparent border-b border-b-transparent transform -translate-y-0.5"></div>
            </div>
          </div>
        </div>
      ),
      afterIcon: (
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      ),
      color: "from-purple-50 to-pink-50",
    },
  ]

  return (
    <section className=" px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans">Transform Your Customer Communication</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience the relief of organized, efficient customer conversations. Say goodbye to stress and hello to
            clarity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`p-8 border-0 shadow-lg bg-gradient-to-br ${feature.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-3xl`}
            >
              {/* Transformation Visual */}
              <div className="flex items-center justify-center mb-6 space-x-4">
                {feature.beforeIcon}
                {feature.afterIcon}
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 font-sans">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>

              {/* Subtle bottom accent */}
              <div className="mt-6 h-1 bg-white/50 rounded-full mx-auto w-12"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
