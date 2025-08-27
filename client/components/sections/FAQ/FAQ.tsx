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
    <section id="faq" className="w-full py-16 px-4 sm:px-6 lg:px-8 overflow-x-clip scroll-mt-24 lg:scroll-mt-32">
      <div className="max-w-7xl mx-auto min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start min-w-0">
          {/* Left Column */}
          <div className="flex flex-col min-w-0">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-8 text-left break-words">
              Got questions? We&apos;ve got answers
            </h2>
            <div className="flex-1 flex items-center justify-center h-96 relative">
              <Image
                src="/assets/faq.jpg"
                alt="faq"
                width={800}
                height={800}
                className="rounded-3xl max-w-full h-auto"
                priority
              />
              {/* Gradient mask overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white" />
            </div>
          </div>

          {/* Right Column */}
          <div className="pr-2 space-y-1 min-w-0 lg:overscroll-contain [scrollbar-gutter:stable] max-h-none lg:max-h-[80vh]">
            {faqData.map((faq) => (
              <div
                key={faq.id}
                className="border-b border-blue-900/50 hover:bg-gray-50 transition-colors duration-200"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full text-left font-medium text-gray-900 py-4 text-base flex justify-between items-center"
                  aria-expanded={openItem === faq.id}
                  aria-controls={`${faq.id}-panel`}
                >
                  <span className="min-w-0 mr-3 break-words">
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 transition-transform duration-300 text-xl font-bold ${
                      openItem === faq.id
                        ? "rotate-180 text-green-700"
                        : "text-purple-900"
                    }`}
                    aria-hidden="true"
                  >
                    {openItem === faq.id ? "−" : "+"}
                  </span>
                </button>

                {/* Smooth expand without clipping: grid-rows trick */}
                <div
                  id={`${faq.id}-panel`}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    openItem === faq.id
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="text-white text-sm leading-relaxed rounded-lg bg-gradient-to-r from-purple-600/80 to-indigo-900/50 p-4 break-words">
                      {faq.answer}
                    </div>
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
