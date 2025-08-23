"use client";

import { useState } from "react";
import Image from "next/image";

const faqData = [
  {
    id: "item-1",
    question: "What is Inboxlyone?",
    answer:
      "Inboxlyone is an all-in-one inbox that pulls messages from Gmail, Instagram, and Facebook into one clean hub - while still keeping each platform neatly separated.",
  },
  {
    id: "item-2",
    question: "How is this different from just checking my apps?",
    answer:
      "Checking each app might sound fine, but in practice it's chaos - too many tabs, too many distractions, and missed messages. Inboxlyone pulls it all into one inbox. Checking one app is always easier than five.",
  },
  {
    id: "item-3",
    question: "Which platforms can I connect?",
    answer:
      "Right now, Gmail, Facebook Pages, and Instagram Business or Creator accounts linked to a Facebook Page. More platforms will be added soon based on feedback.",
  },
  {
    id: "item-4",
    question: "How many accounts can I connect?",
    answer:
      "For now, you can connect 1 account per platform. Multiple accounts per platform are coming soon.",
  },
  {
    id: "item-5",
    question: "Can I reply from Inboxlyone?",
    answer:
      "Yes! You can reply to regular Instagram and Facebook messages directly inside Inboxlyone. For advanced features like reels, file uploads, or GIFs, we'll open the native app. For Gmail, clicking reply takes you straight to your mail client so you can send the message there.",
  },
  {
    id: "item-6",
    question: "Will my data be safe?",
    answer:
      "Yes. Your messages stay on their original platforms. Inboxlyone only requests the permissions needed to display and send messages in one place. We never sell or share your data.",
  },
  {
    id: "item-7",
    question: "Does it mix all my messages together?",
    answer:
      "No. Everything flows into one inbox, but it's clearly separated by platform so you always know where each message came from.",
  },
  {
    id: "item-8",
    question: "How much does Inboxlyone cost?",
    answer:
      "Inboxlyone will be free during early access. Later, we'll introduce simple pricing plans so you only pay for what you need.",
  },
  {
    id: "item-9",
    question: "When can I start using it?",
    answer:
      "Launching soon. Waitlist members get in first before public launch.",
  },
  {
    id: "item-10",
    question: "Do I need to install anything?",
    answer:
      "Nope. Inboxlyone runs right in your browser. Just log in, connect your accounts, and you're set up in minutes.",
  },
  {
    id: "item-11",
    question: "Will you add more platforms?",
    answer:
      "Yes! We're starting with Gmail, Instagram, and Facebook, but more channels are on the way.",
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    setOpenItem(openItem === itemId ? null : itemId);
  };

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Title and Image (locked height, no movement) */}
          <div className="flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-8 text-left">
              Got questions? We've got answers
            </h2>
            <div className="flex-1 flex items-center justify-center h-96 shrink-0 relative">
              <Image
                src="/assets/faq.jpg"
                alt="faq"
                width={800}
                height={800}
                className=" rounded-3xl"
              />

              {/* Gradient mask overlay for fade */}
              <div className="absolute inset-0  bg-gradient-to-b from-white/5 via-transparent to-white"></div>
            </div>
          </div>

          {/* Right Column - FAQ (fixed height, scrolls internally) */}
          <div className="h-[750px]  pr-2 [scrollbar-gutter:stable] space-y-1">
            {faqData.map((faq) => (
              <div
                key={faq.id}
                className="border-b border-blue-900/50 hover:bg-gray-50 transition-colors duration-200"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full text-left font-medium text-gray-900 py-4 text-base flex justify-between items-center"
                >
                  {faq.question}
                  <span
                    className={`transition-all duration-300 ease-in-out text-xl font-bold ${
                      openItem === faq.id ? "transform rotate-180 text-green-700" : " text-purple-900"
                    }`}
                  >
                    {openItem === faq.id ? "−" : "+"}
                  </span>
                </button>

                {/* Keep your expand/collapse animation; it now only affects the inner scroll, not the layout */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openItem === faq.id ? "max-h-96 pb-4" : "max-h-0"
                  }`}
                >
                  <div className="text-white text-sm leading-relaxed rounded-lg bg-gradient-to-r from-purple-600/80 to-indigo-900/50 p-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
