"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Mail, Instagram, Facebook } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  userName: string;
  message: string;
  platform: "Gmail" | "Instagram" | "Facebook";
  avatar: string;
  timestamp: number;
}

const sampleMessages = [
  {
    userName: "Olivia Smith",
    message:
      "Yo! I’m looking to buy a custom logo for my boutique. Do you take orders?",
    platform: "Instagram" as const,
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    userName: "Jordan Tech",
    message:
      "Hello, I’ve been experiencing issues with the payment system on your website. Could you assist me with resolving this?",
    platform: "Gmail" as const,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    userName: "Sophia Lee",
    message:
      "Hi! I saw your designs. Can I order a few of your illustrations for my shop?",
    platform: "Facebook" as const,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    userName: "Mike & Co.",
    message: "Hey, can you make 10 Instagram posts for our new product launch?",
    platform: "Instagram" as const,
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    userName: "Emma Clark",
    message:
      "I noticed that the download link for my recent purchase expired. Could you please resend it or provide a new link?",
    platform: "Gmail" as const,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    userName: "Carlos Ramirez",
    message:
      "Can I order custom illustrations for my website banner? Interested in pricing.",
    platform: "Facebook" as const,
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    userName: "Nina Boutique",
    message:
      "Hi! I want to buy 5 of your handmade candles. Do you ship internationally?",
    platform: "Instagram" as const,
    avatar: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    userName: "Liam Parker",
    message:
      "Hello, I noticed some discrepancies in my recent order. Could you check and confirm the shipment details?",
    platform: "Gmail" as const,
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
  },
];

const platformIcons = {
  Gmail: Mail,
  Instagram: Instagram,
  Facebook: Facebook,
};

const platformColors = {
  Gmail: "text-red-500",
  Instagram: "text-pink-500",
  Facebook: "text-blue-600",
};

export function LiveMessagesFeed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newestMessageId, setNewestMessageId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => {
        // filter out already visible messages
        const available = sampleMessages.filter(
          (msg) =>
            !prev.some(
              (p) => p.userName === msg.userName && p.message === msg.message
            )
        );

        // if nothing left, reset pool (optional)
        const pool = available.length > 0 ? available : sampleMessages;

        // pick one from remaining
        const randomMessage = pool[Math.floor(Math.random() * pool.length)];

        const newMessage: Message = {
          ...randomMessage,
          id: `${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
        };

        setNewestMessageId(newMessage.id);

        return [newMessage, ...prev].slice(0, 3);
      });

      // clear highlight after animation
      setTimeout(() => {
        setNewestMessageId(null);
      }, 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-0 overflow-x-clip">
      <div className="mx-auto flex justify-center min-w-0">
        <div className="w-full max-w-[600px] rounded-lg bg-slate-600/10 p-2 sm:p-3 h-[420px] sm:h-[420px] overflow-hidden">
          {/* Header */}
          <div className="flex items-baseline justify-between min-w-0">
            <h2 className="flex items-center gap-2 font-bold min-w-0">
              <Image
                src="/assets/inboxlyone.png"
                alt="Inboxlyone"
                width={30}
                height={30}
                className="object-contain mb-4 mx-2"
              />
              <span className="truncate">Inboxlyone</span>
            </h2>
            <h2 className="shrink-0 text-xs sm:text-sm font-mono text-foreground mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Synced
            </h2>
          </div>

          {/* Feed */}
          <div className="space-y-3 min-w-0">
            {messages.map((message, index) => {
              const PlatformIcon = platformIcons[message.platform];
              const platformColor = platformColors[message.platform];
              const isNewest = message.id === newestMessageId;

              return (
                <Card
                  key={message.id}
                  className={`p-3 transition-all duration-700 ease-out transform ${
                    isNewest
                      ? "animate-in slide-in-from-top-4 fade-in-0 scale-in-95 ring-2 ring-purple-900/50 shadow-lg"
                      : index === 2
                        ? "animate-out slide-out-to-bottom-4 fade-out-0 scale-out-95"
                        : "hover:shadow-md"
                  }`}
                  style={{
                    animationDuration: isNewest
                      ? "1000ms"
                      : index === 2
                        ? "500ms"
                        : "300ms",
                    animationDelay: isNewest ? "0ms" : `${index * 2000}ms`,
                    backgroundColor: isNewest
                      ? "hsl(var(--accent) / 0.1)"
                      : undefined,
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage
                        src={message.avatar || "/placeholder.svg"}
                        alt={message.userName}
                      />
                      <AvatarFallback className="text-xs">
                        {message.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 min-w-0">
                        <span className="text-sm font-medium text-gray-600/50 truncate">
                          {message.userName}
                        </span>
                        <PlatformIcon
                          className={`w-4 h-4 shrink-0 ${platformColor}`}
                        />
                        {isNewest && (
                          <span className="text-xs bg-purple-900 text-white px-1.5 py-0.5 rounded-full font-mono animate-pulse shrink-0">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-black leading-relaxed line-clamp-2 break-words">
                        {message.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {message.platform}
                        </span>
                        <span
                          className={`text-xs ${isNewest ? "text-blue-500 font-medium" : "text-muted-foreground"}`}
                        >
                          {isNewest ? "just now" : "now"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                <p>No new messages yet. Stay tuned!</p>
                <p className="text-xs text-gray-500">
                  Messages will appear here as they come in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
