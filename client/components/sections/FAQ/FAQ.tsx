"use client";

import { useState } from "react";

const faqData = [
  {
    id: "item-1",
    question: "What is Inboxlyone?",
    answer:
      "Inboxlyone is  all-in-one inbox that brings messages from Gmail, Instagram, Facebook into a single organized hub - while keeping each platform neatly separated",
  },
  {
    id: "item-2",
    question: "How is this different from just checking my apps?",
    answer:
      "Instead of bouncing between tabs and apps, Inboxlyone centralizes everything. You see every message in one place, stay organized, and never miss something important",
  },
  {
    id: "item-4",
    question: "Will my data be safe?",
    answer:
      "Yes. Security and privacy are top priorities. Inboxlyone doesn’t hold your messages - they remain securely in their respective platforms. We only access the data needed to display and let you reply inside your inbox. Nothing is stored, sold, or shared.",
  },

  {
    id: "item-5",
    question: "Does it mix all my messages together?",
    answer:
      "No. Everything flows into one inbox, but it’s clearly separated by platform so you always know where each message came from",
  },
  {
    id: "item-6",
    question: "Which platforms can I connect?",
    answer:
      "We support Facebook Pages and Instagram Business or Creator accounts that are connected to a Facebook Page. Gmail is also supported.. More platforms will be added soon based on user feedback and demand.",
  },
  {
    id: "item-7",
    question: "Is it free?",
    answer:
      "Early access is free. Later, we’ll introduce flexible plans — but joining now guarantees you free early access",
  },
  {
    id: "item-8",
    question: "When can I start using it?",
    answer:
      "Launching soon. Waitlist members get in first before public launch",
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    setOpenItem(openItem === itemId ? null : itemId);
  };

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-8">
            Got questions? We've got answers
          </h2>
        </div>

        <div className="w-full space-y-1">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full text-left font-medium text-gray-900 py-4 text-base flex justify-between items-center"
              >
                {faq.question}
                <span
                  className={`transition-transform text-purple-900 duration-200 ${openItem === faq.id ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openItem === faq.id ? "max-h-96 pb-4" : "max-h-0"
                }`}
              >
                <div className="text-white text-sm leading-relaxed rounded-lg bg-gradient-to-r from-purple-600 to-indigo-900 p-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
